package com.ajegt.backeng.members;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@Transactional
public class MemberService {
    private final MemberRepository members;

    public MemberService(MemberRepository members) {
        this.members = members;
    }

    @Transactional(readOnly = true)
    public List<MemberResponse> findAll(String status, String search) {
        MemberStatus requestedStatus = null;
        if (status != null && !status.isBlank() && !status.equalsIgnoreCase("all")) {
            try {
                requestedStatus = MemberStatus.valueOf(status.trim().toUpperCase(Locale.ROOT));
            } catch (IllegalArgumentException exception) {
                throw new InvalidMemberFilterException();
            }
        }

        MemberStatus filterStatus = requestedStatus;
        String query = search == null ? "" : search.trim().toLowerCase(Locale.ROOT);
        return members.findAll(Sort.by(Sort.Order.asc("lastName"), Sort.Order.asc("firstName"))).stream()
                .filter(member -> filterStatus == null || member.getStatus() == filterStatus)
                .filter(member -> query.isEmpty() || searchableText(member).contains(query))
                .map(MemberResponse::from)
                .toList();
    }

    public MemberResponse create(MemberRequest request) {
        String email = normalizeEmail(request.email());
        if (members.existsByEmailIgnoreCase(email)) throw new DuplicateMemberEmailException();
        MemberEntity member = new MemberEntity(request.firstName().trim(), request.lastName().trim(), email,
                request.phone() == null ? "" : request.phone().trim(), request.role().trim(), request.joinedAt());
        return MemberResponse.from(members.save(member));
    }

    public MemberResponse update(UUID id, MemberRequest request) {
        MemberEntity member = getEntity(id);
        if (members.existsByEmailIgnoreCaseAndIdNot(normalizeEmail(request.email()), id)) {
            throw new DuplicateMemberEmailException();
        }
        member.update(request);
        return MemberResponse.from(members.save(member));
    }

    public MemberResponse updateStatus(UUID id, MemberStatus status) {
        MemberEntity member = getEntity(id);
        member.setStatus(status);
        return MemberResponse.from(members.save(member));
    }

    private MemberEntity getEntity(UUID id) {
        return members.findById(id).orElseThrow(() -> new MemberNotFoundException(id));
    }

    private static String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private static String searchableText(MemberEntity member) {
        return (member.getFirstName() + " " + member.getLastName() + " " + member.getEmail() + " " + member.getRole())
                .toLowerCase(Locale.ROOT);
    }

    public static class InvalidMemberFilterException extends RuntimeException {
        public InvalidMemberFilterException() { super("Le filtre de statut doit être active, archived ou all."); }
    }
}
