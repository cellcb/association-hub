package com.assoc.scheduler.repository;

import com.assoc.scheduler.entity.ScheduleExcludedDate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface ScheduleExcludedDateRepository extends JpaRepository<ScheduleExcludedDate, Long> {

    List<ScheduleExcludedDate> findByStrategyId(Long strategyId);

    boolean existsByStrategyIdAndExcludedDate(Long strategyId, LocalDate excludedDate);
}
