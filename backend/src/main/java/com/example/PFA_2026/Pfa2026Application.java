package com.example.PFA_2026;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class Pfa2026Application {
	public static void main(String[] args) {
		SpringApplication.run(Pfa2026Application.class, args);
	}
}