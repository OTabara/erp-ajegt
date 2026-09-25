package com.ajegt.backeng.events;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "events")
public class EventEntity {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @Column(nullable = false, length = 120)
    private String title;
    @Column(nullable = false, length = 500)
    private String description;
    @Column(nullable = false, length = 180)
    private String location;
    @Column(nullable = false)
    private LocalDateTime startsAt;
    @Column(nullable = false)
    private LocalDateTime endsAt;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 12)
    private EventStatus status;
    @Column(nullable = false)
    private LocalDateTime createdAt;

    protected EventEntity() {}

    public EventEntity(EventRequest request) {
        update(request);
        this.status = EventStatus.DRAFT;
        this.createdAt = LocalDateTime.now();
    }

    public void update(EventRequest request) {
        this.title = request.title().trim();
        this.description = request.description() == null ? "" : request.description().trim();
        this.location = request.location().trim();
        this.startsAt = request.startsAt();
        this.endsAt = request.endsAt();
    }

    public UUID getId() { return id; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getLocation() { return location; }
    public LocalDateTime getStartsAt() { return startsAt; }
    public LocalDateTime getEndsAt() { return endsAt; }
    public EventStatus getStatus() { return status; }
    public void setStatus(EventStatus status) { this.status = status; }
}
