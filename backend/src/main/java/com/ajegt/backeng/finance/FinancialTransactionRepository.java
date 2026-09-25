package com.ajegt.backeng.finance;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface FinancialTransactionRepository extends JpaRepository<FinancialTransactionEntity, UUID> {
    List<FinancialTransactionEntity> findAllByTransactionDateBetweenOrderByTransactionDateDesc(
            LocalDate from, LocalDate to);
}
