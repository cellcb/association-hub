package com.assoc.iam.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
@Schema(description = "用户部门关系请求")
public class UserDepartmentRequest {
    
    @Schema(description = "用户ID（由路径变量填充，无需在请求体中传递）", example = "1")
    private Long userId;
    
    @Schema(description = "部门ID", example = "1", required = true)
    @NotNull(message = "部门ID不能为空")
    private Long departmentId;
    
    @Schema(description = "职位", example = "软件工程师")
    private String position;
    
    @Schema(description = "是否为主要部门", example = "true")
    private Boolean isPrimary = false;
    
    @Schema(description = "状态", example = "1", allowableValues = {"0", "1", "2"})
    private Integer status = 1; // 1:active, 0:inactive, 2:pending
    
    @Schema(description = "生效日期", example = "2024-01-01")
    private LocalDate startDate;
    
    @Schema(description = "失效日期", example = "2024-12-31")
    private LocalDate endDate;
}
