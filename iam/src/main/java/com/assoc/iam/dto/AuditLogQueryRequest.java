package com.assoc.iam.dto;

import com.assoc.common.audit.AuditResultStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.OffsetDateTime;

@Data
public class AuditLogQueryRequest {

    @Schema(description = "操作动作编码")
    private String action;

    @Schema(description = "资源类型，如 user、tenant、rule")
    private String resource;

    @Schema(description = "用户名过滤")
    private String username;

    @Schema(description = "操作结果")
    private AuditResultStatus resultStatus;

    @Schema(description = "开始时间（ISO 8601）")
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    private OffsetDateTime startTime;

    @Schema(description = "结束时间（ISO 8601）")
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    private OffsetDateTime endTime;
}
