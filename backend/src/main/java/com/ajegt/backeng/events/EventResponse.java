package com.ajegt.backeng.events;

import java.time.LocalDateTime;
import java.util.UUID;

public record EventResponse(UUID id, String title, String description, String location,
                            LocalDateTime startsAt, LocalDateTime endsAt, EventStatus status) {
    static EventResponse from(EventEntity event) {
        return new EventResponse(event.getId(), event.getTitle(), event.getDescription(), event.getLocation(),
                event.getStartsAt(), event.getEndsAt(), event.getStatus());
    }
}
