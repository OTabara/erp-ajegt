package com.ajegt.backeng.members;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/members")
public class MemberController {
    private final MemberService service;

    public MemberController(MemberService service) {
        this.service = service;
    }

    @GetMapping
    public List<MemberResponse> findAll(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search
    ) {
        return service.findAll(status, search);
    }

    @PostMapping
    public ResponseEntity<MemberResponse> create(@Valid @RequestBody MemberRequest request) {
        MemberResponse created = service.create(request);
        return ResponseEntity.created(URI.create("/api/members/" + created.id())).body(created);
    }

    @PutMapping("/{id}")
    public MemberResponse update(@PathVariable UUID id, @Valid @RequestBody MemberRequest request) {
        return service.update(id, request);
    }

    @PatchMapping("/{id}/status")
    public MemberResponse updateStatus(@PathVariable UUID id, @Valid @RequestBody MemberStatusRequest request) {
        return service.updateStatus(id, request.status());
    }

    public record MemberStatusRequest(@NotNull MemberStatus status) {
    }
}
