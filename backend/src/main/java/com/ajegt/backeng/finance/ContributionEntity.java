package com.ajegt.backeng.finance;

import com.ajegt.backeng.members.MemberEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "contributions", uniqueConstraints = @UniqueConstraint(
        name = "uk_contributions_period_key", columnNames = "period_key"))
public class ContributionEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "member_id", nullable = false)
    private MemberEntity member;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 12)
    private ContributionType type;

    @Column(nullable = false)
    private int periodYear;

    private Integer periodMonth;

    @Column(name = "period_key", nullable = false, length = 48)
    private String periodKey;

    @Column(nullable = false, precision = 8, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false)
    private LocalDate paidAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PaymentMethod paymentMethod;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    protected ContributionEntity() {}

    public ContributionEntity(MemberEntity member, ContributionType type, int periodYear, Integer periodMonth,
                              String periodKey, BigDecimal amount, LocalDate paidAt, PaymentMethod paymentMethod) {
        this.member = member;
        this.type = type;
        this.periodYear = periodYear;
        this.periodMonth = periodMonth;
        this.periodKey = periodKey;
        this.amount = amount;
        this.paidAt = paidAt;
        this.paymentMethod = paymentMethod;
        this.createdAt = LocalDateTime.now();
    }

    public UUID getId() { return id; }
    public MemberEntity getMember() { return member; }
    public ContributionType getType() { return type; }
    public int getPeriodYear() { return periodYear; }
    public Integer getPeriodMonth() { return periodMonth; }
    public BigDecimal getAmount() { return amount; }
    public LocalDate getPaidAt() { return paidAt; }
    public PaymentMethod getPaymentMethod() { return paymentMethod; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
