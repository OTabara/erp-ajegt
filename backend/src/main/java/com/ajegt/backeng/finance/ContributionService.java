package com.ajegt.backeng.finance;

import com.ajegt.backeng.members.MemberEntity;
import com.ajegt.backeng.members.MemberRepository;
import com.ajegt.backeng.members.MemberStatus;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class ContributionService {
    private static final BigDecimal ANNUAL_AMOUNT = new BigDecimal("60.00");
    private static final BigDecimal MONTHLY_AMOUNT = new BigDecimal("5.00");

    private final ContributionRepository contributions;
    private final MemberRepository members;

    public ContributionService(ContributionRepository contributions, MemberRepository members) {
        this.contributions = contributions;
        this.members = members;
    }

    @Transactional(readOnly = true)
    public List<ContributionResponse> findByYear(int year) {
        if (year < 2000 || year > 2100) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "L’année demandée est invalide.");
        return contributions.findAllByPeriodYearOrderByPaidAtDesc(year).stream().map(ContributionResponse::from).toList();
    }

    @Transactional
    public ContributionResponse record(ContributionRequest request) {
        if (request.paidAt().isAfter(LocalDate.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La date du paiement ne peut pas être dans le futur.");
        }
        if (request.type() == ContributionType.ANNUAL && request.periodMonth() != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Une cotisation annuelle ne comporte pas de mois.");
        }
        if (request.type() == ContributionType.MONTHLY && request.periodMonth() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Choisissez le mois concerné par la cotisation.");
        }
        MemberEntity member = members.findById(request.memberId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Membre introuvable."));
        if (member.getStatus() != MemberStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Une cotisation ne peut être enregistrée que pour un membre actif.");
        }

        List<ContributionEntity> existing = contributions.findAllByMember_IdAndPeriodYear(member.getId(), request.periodYear());
        if (existing.stream().anyMatch(item -> item.getType() != request.type())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Le mode annuel ou mensuel doit rester le même pour un membre pendant une année.");
        }
        String periodKey = request.type() == ContributionType.ANNUAL
                ? member.getId() + "-" + request.periodYear() + "-A"
                : member.getId() + "-" + request.periodYear() + "-M" + request.periodMonth();
        boolean duplicate = existing.stream().anyMatch(item -> request.type() == ContributionType.ANNUAL
                || request.periodMonth().equals(item.getPeriodMonth()));
        if (duplicate) throw new ResponseStatusException(HttpStatus.CONFLICT, "Une cotisation existe déjà pour cette période.");

        BigDecimal amount = request.type() == ContributionType.ANNUAL ? ANNUAL_AMOUNT : MONTHLY_AMOUNT;
        ContributionEntity saved = contributions.save(new ContributionEntity(member, request.type(), request.periodYear(),
                request.periodMonth(), periodKey, amount, request.paidAt(), request.paymentMethod()));
        return ContributionResponse.from(saved);
    }
}
