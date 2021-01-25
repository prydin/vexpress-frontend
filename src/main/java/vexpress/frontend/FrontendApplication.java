package vexpress.frontend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties(Config.class)
public class FrontendApplication {
  public static void main(final String[] args) {
    SpringApplication.run(FrontendApplication.class, args);
  }
}
