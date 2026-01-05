package com.assoc.scheduler.handler;

import com.assoc.scheduler.entity.JobType;
import org.springframework.stereotype.Component;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;

/**
 * Simple registry to lookup handlers by job type.
 */
@Component
public class JobHandlerRegistry {

    private final Map<JobType, JobHandler> handlers = new EnumMap<>(JobType.class);

    public JobHandlerRegistry(List<JobHandler> handlerList) {
        for (JobHandler handler : handlerList) {
            handlers.put(handler.getType(), handler);
        }
    }

    public JobHandler get(JobType type) {
        JobHandler handler = handlers.get(type);
        if (handler == null) {
            throw new IllegalStateException("未找到作业处理器：" + type);
        }
        return handler;
    }
}
