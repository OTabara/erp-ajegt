package com.ajegt.backeng.members;

import com.ajegt.backeng.security.AccountEntity;
import com.ajegt.backeng.security.AccountRepository;
import com.ajegt.backeng.security.AccountStatus;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZoneId;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@Transactional
public class MemberService {
    private final MemberRepository members;
    private final AccountRepository accounts;

    public MemberService(MemberRepository members, AccountRepository accounts) {
        this.members = members;
        this.accounts = accounts;
    }

    public List<MemberResponse> findAll(String status, String search) {
        synchronizeApprovedAccounts();
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

    public void synchronizeAccount(AccountEntity account) {
        if (account.getStatus() != AccountStatus.ACTIVE) return;

        MemberEntity member = members.findByEmailIgnoreCase(normalizeEmail(account.getEmail()))
                .orElseGet(() -> newMemberFrom(account));
        String[] name = splitDisplayName(account.getDisplayName());
        member.updateProfile(name[0], name[1], account.getPhone());
        members.save(member);
    }

    private void synchronizeApprovedAccounts() {
        accounts.findAllByStatusOrderByCreatedAtAsc(AccountStatus.ACTIVE).forEach(this::ensureAccountListed);
    }

    private void ensureAccountListed(AccountEntity account) {
        if (account.getStatus() != AccountStatus.ACTIVE
                || members.existsByEmailIgnoreCase(normalizeEmail(account.getEmail()))) return;
        members.save(newMemberFrom(account));
    }

    private MemberEntity newMemberFrom(AccountEntity account) {
        String[] name = splitDisplayName(account.getDisplayName());
        return new MemberEntity(name[0], name[1], normalizeEmail(account.getEmail()), account.getPhone(), "Membre",
                account.getCreatedAt().atZone(ZoneId.systemDefault()).toLocalDate());
    }

    private static String[] splitDisplayName(String displayName) {
        String[] parts = displayName.trim().split("\\s+", 2);
        String firstName = truncate(parts[0], 80);
        String lastName = parts.length > 1 ? truncate(parts[1], 80) : "Membre";
        return new String[] { firstName, lastName };
    }

    private static String truncate(String value, int maxLength) {
        return value.length() <= maxLength ? value : value.substring(0, maxLength);
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
