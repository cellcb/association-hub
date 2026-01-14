package com.assoc.ai.controller;

import com.assoc.ai.dto.VectorStats;
import com.assoc.ai.service.RagService;
import com.assoc.common.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * Vector administration API controller.
 */
@RestController
@RequestMapping("/api/admin/vectors")
@RequiredArgsConstructor
@Tag(name = "Vector Admin", description = "Vector management API")
public class VectorAdminController {

    private final RagService ragService;

    @GetMapping("/stats")
    @Operation(summary = "Get vector statistics", description = "Get statistics about stored vectors")
    public Result<VectorStats> getStats() {
        VectorStats stats = ragService.getStats();
        return Result.success(stats);
    }
}
