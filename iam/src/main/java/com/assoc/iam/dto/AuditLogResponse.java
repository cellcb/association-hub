package com.assoc.iam.dto;

import com.assoc.common.audit.AuditResultStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.List;

@Data
public class AuditLogResponse {

    @Schema(description = "审计记录ID")
    private Long id;

    @Schema(description = "用户ID")
    private Long userId;

    @Schema(description = "用户名")
    private String username;

    @Schema(description = "角色列表")
    private List<String> roles;

    @Schema(description = "权限列表")
    private List<String> permissions;

    @Schema(description = "动作编码")
    private String action;

    @Schema(description = "资源标识")
    private String resource;

    @Schema(description = "备注")
    private String remark;

    @Schema(description = "请求路径")
    private String requestUri;

    @Schema(description = "HTTP 方法")
    private String httpMethod;

    @Schema(description = "客户端 IP")
    private String clientIp;

    @Schema(description = "User-Agent")
    private String userAgent;

    @Schema(description = "请求参数（已脱敏）")
    private String parameters;

    @Schema(description = "结果状态")
    private AuditResultStatus resultStatus;

    @Schema(description = "结果描述")
    private String resultMessage;

    @Schema(description = "耗时（毫秒）")
    private Long latencyMs;

    @Schema(description = "发生时间")
    private OffsetDateTime occurredAt;
}
