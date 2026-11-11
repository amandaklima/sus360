package br.unicap.sus360;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class Sus360Application {

    public static void main(String[] args) {
        SpringApplication.run(Sus360Application.class, args);
    }
}
