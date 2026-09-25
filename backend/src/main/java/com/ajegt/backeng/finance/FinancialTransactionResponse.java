package com.ajegt.backeng.finance;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record FinancialTransactionResponse(
        UUID id,
        FinancialTransactionType type,
        String category,
        String description,
        BigDecimal amount,
        LocalDate transactionDate,
        PaymentMethod paymentMethod
) {
    static FinancialTransactionResponse from(FinancialTransactionEntity item) {
        return new FinancialTransactionResponse(item.getId(), item.getType(), item.getCategory(),
                item.getDescription(), item.getAmount(), item.getTransactionDate(), item.getPaymentMethod());
    }
}
