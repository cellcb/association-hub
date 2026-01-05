package com.assoc.iam.controller;

import com.assoc.common.Result;
import com.assoc.iam.dto.AuditLogQueryRequest;
import com.assoc.iam.dto.AuditLogResponse;
import com.assoc.iam.service.AuditLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/iam/audit/logs")
@RequiredArgsConstructor
@Tag(name = "审计日志", description = "审计日志查询接口")
@SecurityRequirement(name = "Bearer Authentication")
public class AuditLogController {

    private final AuditLogService auditLogService;

    @Operation(
        summary = "分页查询审计日志",
        description = "按动作、资源、用户及时间范围过滤审计日志",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "查询成功",
                content = @Content(schema = @Schema(implementation = AuditLogResponse.class))
            )
        }
    )
    @GetMapping
    public Result<Page<AuditLogResponse>> page(
        AuditLogQueryRequest queryRequest,
        @PageableDefault(size = 20, sort = "occurredAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Page<AuditLogResponse> page = auditLogService.search(queryRequest, pageable);
        return Result.success(page);
    }
}
