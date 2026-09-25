package com.ajegt.backeng.events;

import com.ajegt.backeng.security.AccountEntity;
import com.ajegt.backeng.security.AccountRepository;
import com.ajegt.backeng.security.AccountStatus;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.UUID;

@Service
public class EventService {
    private final EventRepository repository;
    private final EventRegistrationRepository registrations;
    private final AccountRepository accounts;
    public EventService(EventRepository repository, EventRegistrationRepository registrations, AccountRepository accounts) {
        this.repository = repository; this.registrations = registrations; this.accounts = accounts;
    }

    @Transactional(readOnly = true)
    public List<EventResponse> findAll(boolean manager, String email) {
        List<EventEntity> events = manager ? repository.findAllByOrderByStartsAtAsc()
                : repository.findAllByStatusOrderByStartsAtAsc(EventStatus.PUBLISHED);
        AccountEntity account = findActiveAccount(email);
        return events.stream().map(event -> EventResponse.from(event,
                registrations.existsByEvent_IdAndAccount_Id(event.getId(), account.getId()),
                registrations.countByEvent_Id(event.getId()))).toList();
    }

    @Transactional
    public EventResponse create(EventRequest request) {
        validateDates(request);
        return response(repository.save(new EventEntity(request)), null);
    }

    @Transactional
    public EventResponse update(UUID id, EventRequest request) {
        validateDates(request);
        EventEntity event = find(id);
        event.update(request);
        return response(repository.save(event), null);
    }

    @Transactional
    public EventResponse updateStatus(UUID id, EventStatus status) {
        EventEntity event = find(id);
        event.setStatus(status);
        return response(repository.save(event), null);
    }

    @Transactional
    public EventResponse register(UUID id, String email) {
        EventEntity event = find(id);
        AccountEntity account = findActiveAccount(email);
        if (event.getStatus() != EventStatus.PUBLISHED)
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cet événement n’accepte pas d’inscriptions.");
        if (!event.getStartsAt().isAfter(java.time.LocalDateTime.now()))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Les inscriptions à cet événement sont terminées.");
        if (registrations.existsByEvent_IdAndAccount_Id(id, account.getId()))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Vous êtes déjà inscrit à cet événement.");
        registrations.save(new EventRegistrationEntity(event, account));
        return response(event, account);
    }

    @Transactional
    public EventResponse unregister(UUID id, String email) {
        EventEntity event = find(id);
        AccountEntity account = findActiveAccount(email);
        if (!registrations.existsByEvent_IdAndAccount_Id(id, account.getId()))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Vous n’êtes pas inscrit à cet événement.");
        registrations.deleteByEvent_IdAndAccount_Id(id, account.getId());
        return response(event, account);
    }

    private EventResponse response(EventEntity event, AccountEntity account) {
        boolean registered = account != null && registrations.existsByEvent_IdAndAccount_Id(event.getId(), account.getId());
        return EventResponse.from(event, registered, registrations.countByEvent_Id(event.getId()));
    }

    private AccountEntity findActiveAccount(String email) {
        AccountEntity account = accounts.findByEmailIgnoreCase(email).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Compte introuvable."));
        if (account.getStatus() != AccountStatus.ACTIVE)
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Le compte doit être actif pour s’inscrire.");
        return account;
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
