package com.assoc.iam.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDate;

@Data
@Schema(description = "用户部门关系更新请求")
public class UserDepartmentUpdateRequest {
    
    @Schema(description = "职位", example = "高级软件工程师")
    private String position;
    
    @Schema(description = "是否为主要部门", example = "true")
    private Boolean isPrimary;
    
    @Schema(description = "状态", example = "1", allowableValues = {"0", "1", "2"})
    private Integer status;
    
    @Schema(description = "生效日期", example = "2024-01-01")
    private LocalDate startDate;
    
    @Schema(description = "失效日期", example = "2024-12-31")
    private LocalDate endDate;
}
