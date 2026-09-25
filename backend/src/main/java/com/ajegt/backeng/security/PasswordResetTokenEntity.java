package com.ajegt.backeng.security;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "password_reset_tokens", uniqueConstraints =
        @UniqueConstraint(name = "uk_password_reset_token_hash", columnNames = "token_hash"))
public class PasswordResetTokenEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "account_id", nullable = false)
    private AccountEntity account;

    @Column(name = "token_hash", nullable = false, length = 64)
    private String tokenHash;

    @Column(nullable = false)
    private Instant expiresAt;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column
    private Instant usedAt;

    protected PasswordResetTokenEntity() { }

    public PasswordResetTokenEntity(AccountEntity account, String tokenHash, Instant expiresAt) {
        this.account = account;
        this.tokenHash = tokenHash;
        this.expiresAt = expiresAt;
        this.createdAt = Instant.now();
    }

    public AccountEntity getAccount() { return account; }
    public Instant getCreatedAt() { return createdAt; }
    public boolean isUsableAt(Instant now) { return usedAt == null && expiresAt.isAfter(now); }
    public void markUsed(Instant now) { this.usedAt = now; }
}
