package com.assoc.ai.service;

import com.assoc.common.event.VectorSyncable;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * 向量化数据同步服务。
 * 自动发现所有 VectorSyncable 实现，并协调批量同步操作。
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class VectorSyncService {

    private final List<VectorSyncable> syncables;

    /**
     * 同步所有实体类型的向量数据
     * @return 各实体类型同步的记录数
     */
    public Map<String, Integer> resyncAll() {
        Map<String, Integer> results = new LinkedHashMap<>();
        for (VectorSyncable syncable : syncables) {
            try {
                int count = syncable.resyncVectors();
                results.put(syncable.getEntityType(), count);
                log.info("Resynced {} {} records", count, syncable.getEntityType());
            } catch (Exception e) {
                log.error("Failed to resync {}: {}", syncable.getEntityType(), e.getMessage(), e);
                results.put(syncable.getEntityType(), -1);
            }
        }
        return results;
    }

    /**
     * 同步指定实体类型的向量数据
     * @param entityType 实体类型
     * @return 同步的记录数
     */
    public int resyncByType(String entityType) {
        return syncables.stream()
                .filter(s -> s.getEntityType().equals(entityType))
                .findFirst()
                .map(syncable -> {
                    int count = syncable.resyncVectors();
                    log.info("Resynced {} {} records", count, entityType);
                    return count;
                })
                .orElseThrow(() -> new IllegalArgumentException("Unknown entity type: " + entityType));
    }

    /**
     * 获取支持同步的实体类型列表
     * @return 实体类型列表
     */
    public List<String> getSupportedTypes() {
        return syncables.stream()
                .map(VectorSyncable::getEntityType)
                .toList();
    }
}
