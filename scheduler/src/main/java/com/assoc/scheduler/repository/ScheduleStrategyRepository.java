package com.assoc.scheduler.repository;

import com.assoc.scheduler.entity.ScheduleStrategy;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ScheduleStrategyRepository extends JpaRepository<ScheduleStrategy, Long> {
}
