package com.assoc.scheduler.repository;

import com.assoc.scheduler.entity.SchedulerJob;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SchedulerJobRepository extends JpaRepository<SchedulerJob, Long> {
    List<SchedulerJob> findByScheduleStrategyId(Long strategyId);
}
