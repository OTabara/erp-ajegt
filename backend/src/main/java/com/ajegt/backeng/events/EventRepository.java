package com.ajegt.backeng.events;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface EventRepository extends JpaRepository<EventEntity, UUID> {
    List<EventEntity> findAllByOrderByStartsAtAsc();
    List<EventEntity> findAllByStatusOrderByStartsAtAsc(EventStatus status);
}
