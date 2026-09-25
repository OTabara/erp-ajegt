package com.ajegt.backeng.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.csrf.HttpSessionCsrfTokenRepository;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
public class SecurityConfig {
    @Bean
    SecurityFilterChain apiSecurity(HttpSecurity http) throws Exception {
        return http
                .csrf(csrf -> csrf.csrfTokenRepository(new HttpSessionCsrfTokenRepository()))
                .cors(Customizer.withDefaults())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers("/api/auth/csrf", "/api/auth/login", "/api/auth/register",
                                "/api/auth/password-reset/**").permitAll()
                        .requestMatchers("/api/auth/pending-registrations/**").hasAnyRole("SECRETARY", "ADMIN")
                        .requestMatchers("/api/finance/**").hasAnyRole("TREASURER", "ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/events/**").hasAnyRole("MEMBER", "SECRETARY", "TREASURER", "ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/events/*/registrations").hasAnyRole("MEMBER", "SECRETARY", "TREASURER", "ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/events/*/registrations").hasAnyRole("MEMBER", "SECRETARY", "TREASURER", "ADMIN")
                        .requestMatchers("/api/events/**").hasAnyRole("SECRETARY", "ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/members/**").hasAnyRole("MEMBER", "SECRETARY", "TREASURER", "ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/members/**").hasAnyRole("SECRETARY", "ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/members/**").hasAnyRole("SECRETARY", "ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/members/**").hasAnyRole("SECRETARY", "ADMIN")
                        .requestMatchers("/api/**").authenticated()
                        .anyRequest().permitAll())
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint((request, response, exception) -> response.sendError(401))
                        .accessDeniedHandler((request, response, exception) -> response.sendError(403)))
                .formLogin(form -> form
                        .loginProcessingUrl("/api/auth/login")
                        .usernameParameter("email")
                        .passwordParameter("password")
                        .successHandler((request, response, authentication) -> response.setStatus(204))
                        .failureHandler((request, response, exception) -> {
                            response.setStatus(401);
                            response.setContentType(MediaType.APPLICATION_PROBLEM_JSON_VALUE);
                            response.getWriter().write("{\"detail\":\"Adresse e-mail ou mot de passe incorrect.\"}");
                        }))
                .logout(logout -> logout
                        .logoutUrl("/api/auth/logout")
                        .logoutSuccessHandler((request, response, authentication) -> response.setStatus(204)))
                .build();
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource(Environment environment) {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.stream(environment.getProperty("ajegt.cors.allowed-origin",
                "http://127.0.0.1:5173,http://localhost:5173").split(",")).map(String::trim).toList());
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Content-Type", "Accept", "X-CSRF-TOKEN"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        return source;
    }
}
