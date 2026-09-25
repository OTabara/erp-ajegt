package com.ajegt.backeng.finance;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "financial_transactions")
public class FinancialTransactionEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_type", nullable = false, length = 8)
    private FinancialTransactionType type;

    @Column(nullable = false, length = 60)
    private String category;

    @Column(nullable = false, length = 160)
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(name = "transaction_date", nullable = false)
    private LocalDate transactionDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false, length = 20)
    private PaymentMethod paymentMethod;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    protected FinancialTransactionEntity() {}

    public FinancialTransactionEntity(FinancialTransactionType type, String category, String description,
                                      BigDecimal amount, LocalDate transactionDate, PaymentMethod paymentMethod) {
        this.type = type;
        this.category = category.trim();
        this.description = description.trim();
        this.amount = amount;
        this.transactionDate = transactionDate;
        this.paymentMethod = paymentMethod;
        this.createdAt = LocalDateTime.now();
    }

    public UUID getId() { return id; }
    public FinancialTransactionType getType() { return type; }
    public String getCategory() { return category; }
    public String getDescription() { return description; }
    public BigDecimal getAmount() { return amount; }
    public LocalDate getTransactionDate() { return transactionDate; }
    public PaymentMethod getPaymentMethod() { return paymentMethod; }
}
