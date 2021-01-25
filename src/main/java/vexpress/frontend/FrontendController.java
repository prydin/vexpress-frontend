package vexpress.frontend;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import javax.annotation.PostConstruct;
import javax.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

@RestController
public class FrontendController {
  static final Pattern routedUrlPattern = Pattern.compile("^\\/\\w+\\/(\\w+)\\/(.+)");
  private final Map<String, String> serviceMap = new HashMap<>();
  @Autowired private Config config;

  private static RoutedRequest parseUrl(final HttpServletRequest rq) {
    final String fullPath = rq.getRequestURI();
    final String query = rq.getQueryString();
    final Matcher m = FrontendController.routedUrlPattern.matcher(fullPath);
    if (!m.matches()) {
      throw new IllegalArgumentException("URL doesn't match pattern");
    }
    return new RoutedRequest(m.group(1), m.group(2), query);
  }

  @PostConstruct
  public void init() {
    serviceMap.put("zipcode", config.getZipcodeUrl());
    serviceMap.put("pricing", config.getPricingUrl());
    serviceMap.put("orders", config.getOrdersUrl());
    serviceMap.put("scheduling", config.getSchedulingUrl());
  }

  @GetMapping("/health")
  public String healthCheck() {
    return "OK";
  }

  @GetMapping("/router/{service}/**")
  public String routeGet(final HttpServletRequest rq) throws URISyntaxException {
    final RoutedRequest rrq = FrontendController.parseUrl(rq);
    final RestTemplate restTemplate = new RestTemplate();
    final String baseUrl = serviceMap.get(rrq.service);
    return restTemplate.getForObject(new URI(rrq.buildURL(baseUrl)), String.class);
  }

  @PostMapping(
      path = "/router/{service}/**",
      produces = "application/json",
      consumes = "application/json")
  public String routeGet(final HttpServletRequest rq, @RequestBody final String payload)
      throws URISyntaxException {
    final RoutedRequest rrq = FrontendController.parseUrl(rq);
    final RestTemplate restTemplate = new RestTemplate();
    final String baseUrl = serviceMap.get(rrq.service);
    return restTemplate.postForObject(new URI(rrq.buildURL(baseUrl)), payload, String.class);
  }

  private static final class RoutedRequest {
    private final String service;

    private final String path;

    private final String query;

    public RoutedRequest(final String service, final String path, final String query) {
      this.service = service;
      this.path = path;
      this.query = query;
    }

    public String buildURL(final String base) {
      final String u = base + "/" + path;
      return query != null && query != "" ? u + "?" + query : u;
    }
  }
}
