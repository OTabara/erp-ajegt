package com.ajegt.backeng.events;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.UUID;

@Service
public class EventService {
    private final EventRepository repository;
    public EventService(EventRepository repository) { this.repository = repository; }

    @Transactional(readOnly = true)
    public List<EventResponse> findAll(boolean manager) {
        List<EventEntity> events = manager ? repository.findAllByOrderByStartsAtAsc()
                : repository.findAllByStatusOrderByStartsAtAsc(EventStatus.PUBLISHED);
        return events.stream().map(EventResponse::from).toList();
    }

    @Transactional
    public EventResponse create(EventRequest request) {
        validateDates(request);
        return EventResponse.from(repository.save(new EventEntity(request)));
    }

    @Transactional
    public EventResponse update(UUID id, EventRequest request) {
        validateDates(request);
        EventEntity event = find(id);
        event.update(request);
        return EventResponse.from(repository.save(event));
    }

    @Transactional
    public EventResponse updateStatus(UUID id, EventStatus status) {
        EventEntity event = find(id);
        event.setStatus(status);
        return EventResponse.from(repository.save(event));
    }

    private EventEntity find(UUID id) {
        return repository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Événement introuvable."));
    }

    private void validateDates(EventRequest request) {
        if (!request.endsAt().isAfter(request.startsAt())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La date de fin doit être après la date de début.");
        }
    }
}
