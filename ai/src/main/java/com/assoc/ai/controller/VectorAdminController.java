package com.assoc.ai.controller;

import com.assoc.ai.dto.VectorStats;
import com.assoc.ai.service.RagService;
import com.assoc.ai.service.VectorSyncService;
import com.assoc.common.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Vector administration API controller.
 */
@RestController
@RequestMapping("/api/admin/vectors")
@RequiredArgsConstructor
@Tag(name = "Vector Admin", description = "Vector management API")
public class VectorAdminController {

    private final RagService ragService;
    private final VectorSyncService vectorSyncService;

    @GetMapping("/stats")
    @Operation(summary = "Get vector statistics", description = "Get statistics about stored vectors")
    public Result<VectorStats> getStats() {
        VectorStats stats = ragService.getStats();
        return Result.success(stats);
    }

    @GetMapping("/sync/types")
    @Operation(summary = "获取支持同步的实体类型", description = "返回所有可以进行向量化同步的实体类型列表")
    public Result<List<String>> getSyncTypes() {
        return Result.success(vectorSyncService.getSupportedTypes());
    }

    @PostMapping("/sync")
    @Operation(summary = "重新同步所有向量数据", description = "重新同步所有实体类型的向量化数据到向量库")
    public Result<Map<String, Integer>> resyncAll() {
        Map<String, Integer> results = vectorSyncService.resyncAll();
        return Result.success(results);
    }

    @PostMapping("/sync/{type}")
    @Operation(summary = "重新同步指定类型的向量数据", description = "重新同步指定实体类型的向量化数据到向量库")
    public Result<Integer> resyncByType(@PathVariable String type) {
        int count = vectorSyncService.resyncByType(type);
        return Result.success(count);
    }
}
