package com.ajegt.backeng.events;

import com.ajegt.backeng.security.AccountEntity;
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
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "event_registrations", uniqueConstraints = @UniqueConstraint(
        name = "uk_event_registrations_event_account", columnNames = {"event_id", "account_id"}))
public class EventRegistrationEntity {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "event_id", nullable = false)
    private EventEntity event;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "account_id", nullable = false)
    private AccountEntity account;
    @Column(nullable = false)
    private LocalDateTime registeredAt;

    protected EventRegistrationEntity() {}
    public EventRegistrationEntity(EventEntity event, AccountEntity account) {
        this.event = event; this.account = account; this.registeredAt = LocalDateTime.now();
    }
}
