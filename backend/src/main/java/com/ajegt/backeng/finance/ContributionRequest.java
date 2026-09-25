package com.ajegt.backeng.finance;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.UUID;

public record ContributionRequest(
        @NotNull UUID memberId,
        @NotNull ContributionType type,
        @Min(2000) @Max(2100) int periodYear,
        @Min(1) @Max(12) Integer periodMonth,
        @NotNull LocalDate paidAt,
        @NotNull PaymentMethod paymentMethod
) {}
