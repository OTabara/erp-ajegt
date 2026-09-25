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
@RequestMapping("/api/finance/contributions")
public class ContributionController {
    private final ContributionService service;

    public ContributionController(ContributionService service) { this.service = service; }

    @GetMapping
    public List<ContributionResponse> find(@RequestParam(required = false) Integer year) {
        int selectedYear = year == null ? Year.now().getValue() : year;
        return service.findByYear(selectedYear);
    }

    @PostMapping
    public ResponseEntity<ContributionResponse> record(@Valid @RequestBody ContributionRequest request) {
        ContributionResponse created = service.record(request);
        return ResponseEntity.created(URI.create("/api/finance/contributions/" + created.id())).body(created);
    }
}
