package com.ajegt.backeng.finance;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.Year;
import java.util.List;

@Service
public class FinancialTransactionService {
    private final FinancialTransactionRepository repository;

    public FinancialTransactionService(FinancialTransactionRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<FinancialTransactionResponse> findByYear(int year) {
        if (year < 2000 || year > 2100) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "L’année demandée est invalide.");
        }
        return repository.findAllByTransactionDateBetweenOrderByTransactionDateDesc(
                        LocalDate.of(year, 1, 1), LocalDate.of(year, 12, 31))
                .stream().map(FinancialTransactionResponse::from).toList();
    }

    @Transactional
    public FinancialTransactionResponse create(FinancialTransactionRequest request) {
        if (request.transactionDate().isAfter(LocalDate.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La date de l’opération ne peut pas être dans le futur.");
        }
        if (request.transactionDate().getYear() != request.periodYear()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "L’année de l’opération doit correspondre à l’année sélectionnée.");
        }
        FinancialTransactionEntity saved = repository.save(new FinancialTransactionEntity(request.type(),
                request.category(), request.description(), request.amount(), request.transactionDate(), request.paymentMethod()));
        return FinancialTransactionResponse.from(saved);
    }
}
