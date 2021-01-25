package vexpress.frontend;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "frontend")
public class Config {
  private String zipcodeUrl;

  private String pricingUrl;

  private String ordersUrl;

  private String schedulingUrl;

  public String getZipcodeUrl() {
    return zipcodeUrl;
  }

  public void setZipcodeUrl(final String zipcodeUrl) {
    this.zipcodeUrl = zipcodeUrl;
  }

  public String getPricingUrl() {
    return pricingUrl;
  }

  public void setPricingUrl(final String pricingUrl) {
    this.pricingUrl = pricingUrl;
  }

  public String getOrdersUrl() {
    return ordersUrl;
  }

  public void setOrdersUrl(final String ordersUrl) {
    this.ordersUrl = ordersUrl;
  }

  public String getSchedulingUrl() {
    return schedulingUrl;
  }

  public void setSchedulingUrl(final String schedulingUrl) {
    this.schedulingUrl = schedulingUrl;
  }
}
