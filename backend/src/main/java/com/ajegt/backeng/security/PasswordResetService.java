package com.ajegt.backeng.security;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;

@Service
public class PasswordResetService {
    private static final Logger log = LoggerFactory.getLogger(PasswordResetService.class);
    private static final Duration TOKEN_LIFETIME = Duration.ofMinutes(30);
    private static final Duration REQUEST_COOLDOWN = Duration.ofMinutes(1);
    private static final String GENERIC_MESSAGE = "Si un compte actif correspond à cette adresse, un lien de réinitialisation va être envoyé.";

    private final AccountRepository accounts;
    private final PasswordResetTokenRepository tokens;
    private final PasswordEncoder passwordEncoder;
    private final ObjectProvider<JavaMailSender> mailSenders;
    private final SecureRandom secureRandom = new SecureRandom();
    private final String frontendUrl;
    private final String fromAddress;

    public PasswordResetService(AccountRepository accounts, PasswordResetTokenRepository tokens,
                                PasswordEncoder passwordEncoder, ObjectProvider<JavaMailSender> mailSenders,
                                @Value("${ajegt.mail.frontend-url:http://127.0.0.1:5173}") String frontendUrl,
                                @Value("${AJEGT_MAIL_FROM:no-reply@ajegt.org}") String fromAddress) {
        this.accounts = accounts;
        this.tokens = tokens;
        this.passwordEncoder = passwordEncoder;
        this.mailSenders = mailSenders;
        this.frontendUrl = frontendUrl.replaceAll("/+$", "");
        this.fromAddress = fromAddress;
    }

    @Transactional
    public String requestReset(String email) {
        AccountEntity account = accounts.findByEmailIgnoreCase(email.trim())
                .filter(value -> value.getStatus() == AccountStatus.ACTIVE)
                .orElse(null);
        if (account == null) return GENERIC_MESSAGE;

        Instant now = Instant.now();
        if (tokens.findTopByAccount_IdOrderByCreatedAtDesc(account.getId())
                .map(PasswordResetTokenEntity::getCreatedAt)
                .filter(createdAt -> createdAt.plus(REQUEST_COOLDOWN).isAfter(now))
                .isPresent()) return GENERIC_MESSAGE;

        JavaMailSender mailSender = mailSenders.getIfAvailable();
        if (mailSender == null) {
            log.warn("Mot de passe oublié demandé, mais le service e-mail n'est pas configuré.");
            return GENERIC_MESSAGE;
        }

        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        tokens.deleteAllByAccount_Id(account.getId());
        tokens.save(new PasswordResetTokenEntity(account, sha256(token), now.plus(TOKEN_LIFETIME)));

        String resetUrl = frontendUrl + "/reset-password?token=" + token;
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(account.getEmail());
        message.setSubject("Réinitialisation de votre mot de passe AJEGT");
        message.setText("Bonjour " + account.getDisplayName() + ",\n\n"
                + "Une demande de réinitialisation de votre mot de passe AJEGT a été faite. "
                + "Utilisez ce lien dans les 30 minutes :\n\n" + resetUrl + "\n\n"
                + "Si vous n'êtes pas à l'origine de cette demande, ignorez ce message.");
        try {
            mailSender.send(message);
        } catch (MailException exception) {
            log.error("Échec de l'envoi du lien de réinitialisation AJEGT.");
            tokens.deleteAllByAccount_Id(account.getId());
        }
        return GENERIC_MESSAGE;
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        if (newPassword.getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new PasswordTooLongException();
        }
        PasswordResetTokenEntity resetToken = tokens.findByTokenHash(sha256(token))
                .filter(value -> value.isUsableAt(Instant.now()))
                .orElseThrow(InvalidPasswordResetException::new);
        AccountEntity account = resetToken.getAccount();
        if (account.getStatus() != AccountStatus.ACTIVE) throw new InvalidPasswordResetException();
        account.updatePasswordHash(passwordEncoder.encode(newPassword));
        resetToken.markUsed(Instant.now());
    }

    private static String sha256(String value) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 indisponible", exception);
        }
    }

    public static class InvalidPasswordResetException extends RuntimeException { }
    public static class PasswordTooLongException extends RuntimeException { }
}
