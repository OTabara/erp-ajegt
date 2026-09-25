package com.ajegt.backeng.finance;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ContributionRepository extends JpaRepository<ContributionEntity, UUID> {
    List<ContributionEntity> findAllByPeriodYearOrderByPaidAtDesc(int periodYear);
    List<ContributionEntity> findAllByMember_IdAndPeriodYear(UUID memberId, int periodYear);
}
