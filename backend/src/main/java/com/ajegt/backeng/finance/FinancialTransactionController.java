package com.ajegt.backeng.finance;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.time.Year;
import java.util.List;

@RestController
@RequestMapping("/api/finance/transactions")
public class FinancialTransactionController {
    private final FinancialTransactionService service;

    public FinancialTransactionController(FinancialTransactionService service) { this.service = service; }

    @GetMapping
    public List<FinancialTransactionResponse> find(@RequestParam(required = false) Integer year) {
        return service.findByYear(year == null ? Year.now().getValue() : year);
    }

    @PostMapping
    public ResponseEntity<FinancialTransactionResponse> create(@Valid @RequestBody FinancialTransactionRequest request) {
        FinancialTransactionResponse created = service.create(request);
        return ResponseEntity.created(URI.create("/api/finance/transactions/" + created.id())).body(created);
    }
}
