package com.assoc.scheduler.handler;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.assoc.scheduler.entity.JobType;
import com.assoc.scheduler.entity.SchedulerJob;
import lombok.Data;
import org.quartz.JobExecutionContext;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class InternalServiceJobHandler implements JobHandler {

    private final ObjectMapper objectMapper;
    private final Map<String, InternalJobTask> taskMap;

    public InternalServiceJobHandler(ObjectMapper objectMapper, List<InternalJobTask> tasks) {
        this.objectMapper = objectMapper;
        this.taskMap = tasks == null ? Collections.emptyMap() :
                tasks.stream().collect(Collectors.toMap(InternalJobTask::getKey, t -> t));
    }

    @Override
    public JobType getType() {
        return JobType.INTERNAL_SERVICE;
    }

    @Override
    public void handle(SchedulerJob job, JobExecutionContext context) throws Exception {
        InternalJobConfig config = objectMapper.readValue(job.getJobConfig(), InternalJobConfig.class);
        if (!StringUtils.hasText(config.getHandlerKey())) {
            throw new IllegalArgumentException("内部作业缺少 handlerKey");
        }
        InternalJobTask task = taskMap.get(config.getHandlerKey());
        if (task == null) {
            throw new IllegalStateException("未注册的内部作业 handler：" + config.getHandlerKey());
        }
        task.execute(config.getParameters());
    }

    @Data
    private static class InternalJobConfig {
        private String handlerKey;
        private Map<String, Object> parameters = Collections.emptyMap();
    }
}
