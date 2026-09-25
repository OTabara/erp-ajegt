package com.ajegt.backeng.finance;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record ContributionResponse(
        UUID id,
        UUID memberId,
        String memberName,
        String memberEmail,
        ContributionType type,
        int periodYear,
        Integer periodMonth,
        BigDecimal amount,
        LocalDate paidAt,
        PaymentMethod paymentMethod
) {
    static ContributionResponse from(ContributionEntity item) {
        return new ContributionResponse(item.getId(), item.getMember().getId(),
                item.getMember().getFirstName() + " " + item.getMember().getLastName(),
                item.getMember().getEmail(), item.getType(), item.getPeriodYear(), item.getPeriodMonth(),
                item.getAmount(), item.getPaidAt(), item.getPaymentMethod());
    }
}
