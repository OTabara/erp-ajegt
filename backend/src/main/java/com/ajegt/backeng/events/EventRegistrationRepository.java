package com.ajegt.backeng.events;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface EventRegistrationRepository extends JpaRepository<EventRegistrationEntity, UUID> {
    boolean existsByEvent_IdAndAccount_Id(UUID eventId, UUID accountId);
    long countByEvent_Id(UUID eventId);
    void deleteByEvent_IdAndAccount_Id(UUID eventId, UUID accountId);
}
