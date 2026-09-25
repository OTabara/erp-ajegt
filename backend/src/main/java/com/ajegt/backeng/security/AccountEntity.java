package com.ajegt.backeng.security;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.time.Instant;
import java.util.Locale;
import java.util.UUID;

@Entity
@Table(name = "user_accounts", uniqueConstraints = @UniqueConstraint(name = "uk_user_accounts_email", columnNames = "email"))
public class AccountEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 160)
    private String email;

    @Column(nullable = false, length = 100)
    private String displayName;

    @Column(nullable = false, length = 100)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AccountRole role;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private AccountStatus status;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    protected AccountEntity() {
    }

    public AccountEntity(String email, String displayName, String passwordHash, AccountRole role) {
        this(email, displayName, passwordHash, role, AccountStatus.ACTIVE);
    }

    public AccountEntity(String email, String displayName, String passwordHash, AccountRole role, AccountStatus status) {
        this.email = email.trim().toLowerCase(Locale.ROOT);
        this.displayName = displayName.trim();
        this.passwordHash = passwordHash;
        this.role = role;
        this.status = status;
        this.createdAt = Instant.now();
    }

    public UUID getId() { return id; }
    public String getEmail() { return email; }
    public String getDisplayName() { return displayName; }
    public String getPasswordHash() { return passwordHash; }
    public AccountRole getRole() { return role; }
    public AccountStatus getStatus() { return status; }
    public Instant getCreatedAt() { return createdAt; }
    public void approve(AccountRole role) { this.role = role; this.status = AccountStatus.ACTIVE; }
    public void reject() { this.status = AccountStatus.REJECTED; }
}
