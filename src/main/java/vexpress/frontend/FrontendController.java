package vexpress.frontend;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import javax.annotation.PostConstruct;
import javax.servlet.ServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.servlet.HandlerMapping;
import org.springframework.web.util.UriComponentsBuilder;

@RestController
public class FrontendController {
  static final Pattern routedUrlPattern = Pattern.compile("^\\/\\w+\\/(\\w+)\\/(.+)");
  private final Map<String, String> serviceMap = new HashMap<>();
  @Autowired private Config config;

  private static RoutedRequest parseUrl(final ServletRequest rq) {
    final String fullPath =
        (String) rq.getAttribute(HandlerMapping.PATH_WITHIN_HANDLER_MAPPING_ATTRIBUTE);
    final Matcher m = FrontendController.routedUrlPattern.matcher(fullPath);
    if (!m.matches()) {
      throw new IllegalArgumentException("URL doesn't match pattern");
    }
    return new RoutedRequest(m.group(1), m.group(2));
  }

  @PostConstruct
  public void init() {
    serviceMap.put("zipcode", config.getZipcodeUrl());
    serviceMap.put("pricing", config.getPricingUrl());
    serviceMap.put("orders", config.getZipcodeUrl());
    serviceMap.put("scheduling", config.getSchedulingUrl());
  }

  @GetMapping("/health")
  public String healthCheck() {
    return "OK";
  }

  @GetMapping("/router/{service}/**")
  public String routeGet(final ServletRequest rq) throws URISyntaxException {
    final RoutedRequest rrq = FrontendController.parseUrl(rq);
    final UriComponentsBuilder builder =
        UriComponentsBuilder.fromHttpUrl(config.getZipcodeUrl() + "/" + rrq.path);
    final RestTemplate restTemplate = new RestTemplate();
    return restTemplate.getForObject(
        new URI(config.getZipcodeUrl() + "/" + rrq.path), String.class);
  }

  @GetMapping(
      path = "/router/{service}/**",
      produces = "application/json",
      consumes = "application/json")
  public String routeGet(final ServletRequest rq, @RequestBody final String payload)
      throws URISyntaxException {
    final RoutedRequest rrq = FrontendController.parseUrl(rq);
    final UriComponentsBuilder builder =
        UriComponentsBuilder.fromHttpUrl(config.getZipcodeUrl() + "/" + rrq.path);
    final RestTemplate restTemplate = new RestTemplate();
    return restTemplate.postForObject(
        new URI(config.getZipcodeUrl() + "/" + rrq.path), payload, String.class);
  }

  private static final class RoutedRequest {
    private final String service;

    private final String path;

    public RoutedRequest(final String service, final String path) {
      this.service = service;
      this.path = path;
    }
  }
}
