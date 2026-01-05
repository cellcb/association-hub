package com.assoc.scheduler.handler;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * 仅用于测试
 * 示例 InternalJobTask，模拟对知识库执行重建索引操作。
 * 供 http-client 脚本中的 INTERNAL_SERVICE 作业示例使用。
 */
@Slf4j
@Component
public class KnowledgeBaseReindexTask implements InternalJobTask {

    @Override
    public String getKey() {
        return "kbReindex";
    }

    @Override
    public void execute(Map<String, Object> params) {
        Object batchSize = params != null ? params.getOrDefault("batchSize", 100) : 100;
        boolean fullRebuild = params != null && Boolean.TRUE.equals(params.get("fullRebuild"));
        log.info("Executing knowledge base reindex task, batchSize={}, fullRebuild={}, params={}",
                batchSize, fullRebuild, params);
        // 在真实场景中这里调用知识库模块的索引重建逻辑；当前仅作占位演示。
    }
}
