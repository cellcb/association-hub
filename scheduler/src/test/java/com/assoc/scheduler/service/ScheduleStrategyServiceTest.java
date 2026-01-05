package com.assoc.scheduler.service;

import com.assoc.common.context.RequestContext;
import com.assoc.scheduler.entity.ScheduleStrategy;
import com.assoc.scheduler.entity.ScheduleType;
import com.assoc.scheduler.repository.ScheduleExcludedDateRepository;
import com.assoc.scheduler.repository.ScheduleStrategyRepository;
import com.assoc.scheduler.repository.SchedulerJobRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;

@ExtendWith(MockitoExtension.class)
class ScheduleStrategyServiceTest {

    @Mock
    private ScheduleStrategyRepository strategyRepository;
    @Mock
    private ScheduleExcludedDateRepository excludedDateRepository;
    @Mock
    private SchedulerJobRepository schedulerJobRepository;
    @Mock
    private SchedulerJobService schedulerJobService;
    @Mock
    private RequestContext requestContext;

    @InjectMocks
    private ScheduleStrategyService service;

    private ScheduleStrategy strategy;

    @BeforeEach
    void setup() {
        strategy = new ScheduleStrategy();
        strategy.setName("test");
    }

    @Test
    void buildFixedRateCron() {
        strategy.setScheduleType(ScheduleType.FIXED_RATE);
        strategy.setIntervalSeconds(30);
        String cron = service.resolveCronExpression(strategy);
        assertEquals("0/30 * * * * ?", cron);
    }

    @Test
    void buildDailyCron() {
        strategy.setScheduleType(ScheduleType.DAILY);
        strategy.setStartTime(LocalDateTime.of(2024, 1, 1, 8, 30, 15));
        String cron = service.resolveCronExpression(strategy);
        assertEquals("15 30 8 * * ?", cron);
    }

    @Test
    void buildWeeklyCron() {
        strategy.setScheduleType(ScheduleType.WEEKLY);
        strategy.setStartTime(LocalDateTime.of(2024, 1, 1, 9, 0, 0));
        strategy.setDaysOfWeek("2,4");
        String cron = service.resolveCronExpression(strategy);
        assertEquals("0 0 9 ? * 2,4", cron);
    }
}
