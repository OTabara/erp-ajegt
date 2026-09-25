package com.ajegt.backeng.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AccountRepository accounts;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    public AuthController(AccountRepository accounts, org.springframework.security.crypto.password.PasswordEncoder passwordEncoder) {
        this.accounts = accounts;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping("/csrf")
    public CsrfResponse csrf(CsrfToken csrfToken) {
        return new CsrfResponse(csrfToken.getToken(), csrfToken.getHeaderName());
    }

    @GetMapping("/session")
    public SessionResponse currentSession(Authentication authentication) {
        AccountEntity account = accounts.findByEmailIgnoreCase(authentication.getName())
                .orElseThrow(() -> new IllegalStateException("Compte authentifié introuvable."));
        return new SessionResponse(account.getId(), account.getEmail(), account.getDisplayName(), account.getRole());
    }

    @PostMapping("/register")
    public RegistrationResponse register(@Valid @RequestBody RegistrationRequest request) {
        String email = request.email().trim().toLowerCase(java.util.Locale.ROOT);
        if (accounts.existsByEmailIgnoreCase(email)) {
            return new RegistrationResponse("Si cette adresse peut être utilisée, la demande sera examinée par un responsable AJEGT.");
        }
        if (request.password().getBytes(java.nio.charset.StandardCharsets.UTF_8).length > 72) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Le mot de passe ne peut pas dépasser 72 octets.");
        }
        accounts.save(new AccountEntity(email, request.displayName(), passwordEncoder.encode(request.password()),
                AccountRole.MEMBER, AccountStatus.PENDING));
        return new RegistrationResponse("Si cette adresse peut être utilisée, la demande sera examinée par un responsable AJEGT.");
    }

    @GetMapping("/pending-registrations")
    public java.util.List<PendingRegistration> pendingRegistrations() {
        return accounts.findAllByStatusOrderByCreatedAtAsc(AccountStatus.PENDING).stream()
                .map(account -> new PendingRegistration(account.getId(), account.getEmail(), account.getDisplayName(), account.getCreatedAt()))
                .toList();
    }

    @PostMapping("/pending-registrations/{id}/approve")
    @Transactional
    public SessionResponse approve(@PathVariable java.util.UUID id, @RequestBody(required = false) ApprovalRequest request,
                                   Authentication authentication) {
        AccountEntity target = pendingAccount(id);
        AccountRole role = request == null || request.role() == null ? AccountRole.MEMBER : request.role();
        boolean admin = authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (!admin && role != AccountRole.MEMBER) throw new AccessDeniedException("Seul un administrateur peut attribuer ce rôle.");
        target.approve(role);
        return new SessionResponse(target.getId(), target.getEmail(), target.getDisplayName(), target.getRole());
    }

    @PostMapping("/pending-registrations/{id}/reject")
    @Transactional
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void reject(@PathVariable java.util.UUID id) { pendingAccount(id).reject(); }

    private AccountEntity pendingAccount(java.util.UUID id) {
        AccountEntity account = accounts.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (account.getStatus() != AccountStatus.PENDING) throw new ResponseStatusException(HttpStatus.CONFLICT, "Cette demande a déjà été traitée.");
        return account;
    }

    public record CsrfResponse(String token, String headerName) { }
    public record SessionResponse(UUID id, String email, String displayName, AccountRole role) { }
    public record RegistrationResponse(String message) { }
    public record PendingRegistration(UUID id, String email, String displayName, java.time.Instant createdAt) { }
    public record ApprovalRequest(AccountRole role) { }
    public record RegistrationRequest(@NotBlank @Email @Size(max = 160) String email,
                                      @NotBlank @Size(max = 100) String displayName,
                                      @NotBlank @Size(min = 12, max = 100) String password) { }
}
