package com.assoc.scheduler.service;

import com.assoc.scheduler.config.SchedulerProperties;
import com.assoc.scheduler.entity.ExecutionStatus;
import com.assoc.scheduler.entity.JobExecutionLog;
import com.assoc.scheduler.entity.JobType;
import com.assoc.scheduler.entity.SchedulerJob;
import com.assoc.scheduler.handler.JobHandler;
import com.assoc.scheduler.handler.JobHandlerRegistry;
import com.assoc.scheduler.repository.JobExecutionLogRepository;
import com.assoc.scheduler.repository.ScheduleExcludedDateRepository;
import com.assoc.scheduler.repository.SchedulerJobRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.quartz.JobExecutionContext;
import org.quartz.JobKey;
import org.quartz.Scheduler;
import org.quartz.SimpleTrigger;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.SimpleTransactionStatus;

import java.util.Date;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SchedulerExecutionServiceImplTest {

    @Mock
    private SchedulerJobRepository jobRepository;
    @Mock
    private ScheduleExcludedDateRepository excludedDateRepository;
    @Mock
    private JobExecutionLogRepository logRepository;
    @Mock
    private JobHandlerRegistry handlerRegistry;
    @Mock
    private Scheduler scheduler;
    @Mock
    private JobExecutionContext jobExecutionContext;
    @Mock
    private JobHandler jobHandler;

    private SchedulerProperties properties;
    private SchedulerExecutionServiceImpl service;
    private PlatformTransactionManager transactionManager;

    private SchedulerJob job;

    @BeforeEach
    void setup() {
        properties = new SchedulerProperties();
        transactionManager = new TestTransactionManager();
        service = new SchedulerExecutionServiceImpl(jobRepository, excludedDateRepository, logRepository,
                handlerRegistry, properties, scheduler, transactionManager);
        job = new SchedulerJob();
        job.setId(1L);
        job.setJobType(JobType.HTTP);
        job.setScheduleStrategyId(10L);
        job.setEnabled(true);
        when(jobExecutionContext.getFireTime()).thenReturn(new Date());
        when(jobExecutionContext.getScheduledFireTime()).thenReturn(new Date());
    }

    @Test
    void executeSuccess() throws Exception {
        when(jobRepository.findById(1L)).thenReturn(java.util.Optional.of(job));
        when(handlerRegistry.get(JobType.HTTP)).thenReturn(jobHandler);

        service.execute(1L, 10L, 0, jobExecutionContext);

        verify(jobHandler).handle(eq(job), eq(jobExecutionContext));
        ArgumentCaptor<JobExecutionLog> captor = ArgumentCaptor.forClass(JobExecutionLog.class);
        verify(logRepository).save(captor.capture());
        assertEquals(ExecutionStatus.SUCCESS, captor.getValue().getStatus());
        verifyNoInteractions(scheduler);
    }

    @Test
    void executeFailureSchedulesRetry() throws Exception {
        when(jobRepository.findById(1L)).thenReturn(java.util.Optional.of(job));
        when(handlerRegistry.get(JobType.HTTP)).thenReturn(jobHandler);
        doThrow(new IllegalStateException("boom")).when(jobHandler).handle(any(), any());
        when(scheduler.checkExists(any(JobKey.class))).thenReturn(true);

        try {
            service.execute(1L, 10L, 0, jobExecutionContext);
        } catch (Exception ignored) {
        }

        verify(scheduler).scheduleJob(any(SimpleTrigger.class));
        ArgumentCaptor<JobExecutionLog> captor = ArgumentCaptor.forClass(JobExecutionLog.class);
        verify(logRepository).save(captor.capture());
        assertEquals(ExecutionStatus.RETRIED, captor.getValue().getStatus());
    }

    private static class TestTransactionManager implements PlatformTransactionManager {
        @Override
        public TransactionStatus getTransaction(TransactionDefinition definition) {
            return new SimpleTransactionStatus();
        }

        @Override
        public void commit(TransactionStatus status) {
            // no-op
        }

        @Override
        public void rollback(TransactionStatus status) {
            // no-op
        }
    }
}
