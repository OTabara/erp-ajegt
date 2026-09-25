package com.ajegt.backeng.events;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/events")
public class EventController {
    private final EventService service;
    public EventController(EventService service) { this.service = service; }

    @GetMapping
    public List<EventResponse> findAll(Authentication authentication) {
        boolean manager = authentication.getAuthorities().stream().anyMatch(authority ->
                authority.getAuthority().equals("ROLE_SECRETARY") || authority.getAuthority().equals("ROLE_ADMIN"));
        return service.findAll(manager, authentication.getName());
    }

    @PostMapping
    public ResponseEntity<EventResponse> create(@Valid @RequestBody EventRequest request) {
        EventResponse created = service.create(request);
        return ResponseEntity.created(URI.create("/api/events/" + created.id())).body(created);
    }

    @PutMapping("/{id}")
    public EventResponse update(@PathVariable UUID id, @Valid @RequestBody EventRequest request) {
        return service.update(id, request);
    }

    @PatchMapping("/{id}/status")
    public EventResponse updateStatus(@PathVariable UUID id, @Valid @RequestBody EventStatusRequest request) {
        return service.updateStatus(id, request.status());
    }

    @PostMapping("/{id}/registrations")
    public EventResponse register(@PathVariable UUID id, Authentication authentication) {
        return service.register(id, authentication.getName());
    }

    @DeleteMapping("/{id}/registrations")
    public EventResponse unregister(@PathVariable UUID id, Authentication authentication) {
        return service.unregister(id, authentication.getName());
    }

    public record EventStatusRequest(@NotNull EventStatus status) {}
}
