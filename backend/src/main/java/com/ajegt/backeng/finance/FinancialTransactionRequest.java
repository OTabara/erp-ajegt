package com.ajegt.backeng.finance;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record FinancialTransactionRequest(
        @NotNull FinancialTransactionType type,
        @NotBlank @Size(max = 60) String category,
        @NotBlank @Size(max = 160) String description,
        @NotNull @DecimalMin("0.01") @Digits(integer = 8, fraction = 2) BigDecimal amount,
        @NotNull LocalDate transactionDate,
        @NotNull PaymentMethod paymentMethod,
        @Min(2000) @Max(2100) int periodYear
) {}
