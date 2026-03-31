package com.canteen.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

// 👇 必须加这行！扫描整个 com.canteen 包，包含 controller、config 等所有子包
@ComponentScan(basePackages = "com.canteen")
@SpringBootApplication
public class CanteenBackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(CanteenBackendApplication.class, args);
    }
}