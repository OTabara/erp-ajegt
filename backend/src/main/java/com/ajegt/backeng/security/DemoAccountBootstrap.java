package com.ajegt.backeng.security;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.env.Environment;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@Profile("dev")
public class DemoAccountBootstrap {
    private static final Logger log = LoggerFactory.getLogger(DemoAccountBootstrap.class);

    @Bean
    ApplicationRunner bootstrapDemoAccount(AccountRepository accounts, PasswordEncoder passwordEncoder, Environment environment) {
        return arguments -> {
            String email = environment.getProperty("ajegt.bootstrap.email", "").trim();
            String password = environment.getProperty("ajegt.bootstrap.password", "");
            String displayName = environment.getProperty("ajegt.bootstrap.display-name", "Responsable AJEGT").trim();

            if (email.isEmpty() || password.isEmpty()) {
                log.warn("Aucun compte de démonstration créé. Définissez AJEGT_BOOTSTRAP_EMAIL et AJEGT_BOOTSTRAP_PASSWORD pour activer la connexion locale.");
                return;
            }
            int passwordBytes = password.getBytes(java.nio.charset.StandardCharsets.UTF_8).length;
            if (password.length() < 12 || passwordBytes > 72) {
                throw new IllegalStateException("AJEGT_BOOTSTRAP_PASSWORD doit contenir au moins 12 caractères et au plus 72 octets en UTF-8.");
            }
            if (accounts.existsByEmailIgnoreCase(email)) return;

            accounts.save(new AccountEntity(email, displayName, passwordEncoder.encode(password), AccountRole.ADMIN));
            log.info("Compte administrateur local créé pour {}.", email);
        };
    }
}
