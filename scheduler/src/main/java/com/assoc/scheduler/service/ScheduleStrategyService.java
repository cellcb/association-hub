package com.assoc.scheduler.service;

import com.assoc.common.context.RequestContext;
import com.assoc.scheduler.entity.ScheduleExcludedDate;
import com.assoc.scheduler.entity.ScheduleStrategy;
import com.assoc.scheduler.entity.ScheduleType;
import com.assoc.scheduler.repository.ScheduleExcludedDateRepository;
import com.assoc.scheduler.repository.ScheduleStrategyRepository;
import com.assoc.scheduler.repository.SchedulerJobRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

/**
 * Manages reusable schedule strategies and their excluded dates.
 */
@Service
@RequiredArgsConstructor
public class ScheduleStrategyService {

    private final ScheduleStrategyRepository strategyRepository;
    private final ScheduleExcludedDateRepository excludedDateRepository;
    private final SchedulerJobRepository schedulerJobRepository;
    private final SchedulerJobService schedulerJobService;
    private final RequestContext requestContext;

    @Transactional
    public ScheduleStrategy createStrategy(ScheduleStrategy strategy, List<LocalDate> excludedDates) {
        strategy.setCronExpression(resolveCronExpression(strategy));
        ScheduleStrategy saved = strategyRepository.save(strategy);
        syncExcludedDates(saved.getId(), excludedDates);
        return saved;
    }

    @Transactional
    public ScheduleStrategy updateStrategy(Long id, ScheduleStrategy updated, List<LocalDate> excludedDates) {
        ScheduleStrategy existing = getStrategyForCurrentTenant(id);
        existing.setName(updated.getName());
        existing.setDescription(updated.getDescription());
        existing.setScheduleType(updated.getScheduleType());
        existing.setStartTime(updated.getStartTime());
        existing.setEndTime(updated.getEndTime());
        existing.setTimeZone(updated.getTimeZone());
        existing.setIntervalSeconds(updated.getIntervalSeconds());
        existing.setDaysOfWeek(updated.getDaysOfWeek());
        existing.setCronExpression(resolveCronExpression(existing));
        ScheduleStrategy saved = strategyRepository.save(existing);
        syncExcludedDates(saved.getId(), excludedDates);
        schedulerJobService.rescheduleJobsForStrategy(saved.getId());
        return saved;
    }

    @Transactional
    public void deleteStrategy(Long id) {
        ScheduleStrategy strategy = getStrategyForCurrentTenant(id);
        boolean hasJobs = !schedulerJobRepository.findByScheduleStrategyId(id).isEmpty();
        if (hasJobs) {
            throw new IllegalStateException("策略仍被作业使用，无法删除");
        }
        excludedDateRepository.deleteAll(excludedDateRepository.findByStrategyId(id));
        strategyRepository.delete(strategy);
    }

    @Transactional
    public void updateExcludedDates(Long strategyId, List<LocalDate> excludedDates) {
        getStrategyForCurrentTenant(strategyId);
        syncExcludedDates(strategyId, excludedDates);
    }

    @Transactional
    public List<ScheduleStrategy> listStrategies() {
        return strategyRepository.findAll();
    }

    @Transactional
    public ScheduleStrategy getStrategy(Long id) {
        return getStrategyForCurrentTenant(id);
    }

    public List<ScheduleExcludedDate> listExcludedDates(Long strategyId) {
        return excludedDateRepository.findByStrategyId(strategyId);
    }

    private void syncExcludedDates(Long strategyId, List<LocalDate> excludedDates) {
        List<ScheduleExcludedDate> existing = excludedDateRepository.findByStrategyId(strategyId);
        if (!existing.isEmpty()) {
            excludedDateRepository.deleteAll(existing);
        }
        if (CollectionUtils.isEmpty(excludedDates)) {
            return;
        }
        List<ScheduleExcludedDate> entities = excludedDates.stream().distinct().map(date -> {
            ScheduleExcludedDate entity = new ScheduleExcludedDate();
            entity.setStrategyId(strategyId);
            entity.setExcludedDate(date);
            entity.setReason("EXCLUDED");
            return entity;
        }).toList();
        excludedDateRepository.saveAll(entities);
    }

    private ScheduleStrategy getStrategyForCurrentTenant(Long id) {
        return strategyRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("未找到对应的调度策略"));
    }

    /**
     * Generates a cron expression from the structured strategy definition.
     */
    public String resolveCronExpression(ScheduleStrategy strategy) {
        ScheduleType type = strategy.getScheduleType();
        if (type == null) {
            throw new IllegalArgumentException("未指定调度类型");
        }
        return switch (type) {
            case CRON -> {
                if (!StringUtils.hasText(strategy.getCronExpression())) {
                    throw new IllegalArgumentException("CRON 类型必须提供 cronExpression");
                }
                yield strategy.getCronExpression();
            }
            case FIXED_RATE -> buildFixedRateCron(strategy);
            case DAILY -> buildDailyCron(strategy);
            case WEEKLY -> buildWeeklyCron(strategy);
        };
    }

    private String buildFixedRateCron(ScheduleStrategy strategy) {
        Integer intervalSeconds = strategy.getIntervalSeconds();
        if (intervalSeconds == null || intervalSeconds <= 0) {
            throw new IllegalArgumentException("FIXED_RATE 类型必须提供 intervalSeconds");
        }
        int interval = Math.max(1, intervalSeconds);
        if (interval >= 60) {
            int minutes = interval / 60;
            return "0 0/" + minutes + " * * * ?";
        }
        return "0/" + interval + " * * * * ?";
    }

    private String buildDailyCron(ScheduleStrategy strategy) {
        if (strategy.getStartTime() == null) {
            throw new IllegalArgumentException("DAILY 类型必须提供 startTime");
        }
        int second = strategy.getStartTime().getSecond();
        int minute = strategy.getStartTime().getMinute();
        int hour = strategy.getStartTime().getHour();
        return second + " " + minute + " " + hour + " * * ?";
    }

    private String buildWeeklyCron(ScheduleStrategy strategy) {
        if (strategy.getStartTime() == null || !StringUtils.hasText(strategy.getDaysOfWeek())) {
            throw new IllegalArgumentException("WEEKLY 类型必须提供 startTime 和 daysOfWeek");
        }
        String[] days = Arrays.stream(strategy.getDaysOfWeek().split(","))
                .map(String::trim)
                .filter(StringUtils::hasText)
                .toArray(String[]::new);
        if (days.length == 0) {
            throw new IllegalArgumentException("WEEKLY 类型必须指定至少一个周几");
        }
        int second = strategy.getStartTime().getSecond();
        int minute = strategy.getStartTime().getMinute();
        int hour = strategy.getStartTime().getHour();
        String dayExpr = String.join(",", days);
        return second + " " + minute + " " + hour + " ? * " + dayExpr;
    }
}
