package com.assoc.iam.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Schema(description = "用户部门关系响应")
public class UserDepartmentResponse {
    
    @Schema(description = "关系ID", example = "1")
    private Long id;
    
    @Schema(description = "用户ID", example = "1")
    private Long userId;
    
    @Schema(description = "用户名", example = "zhangsan")
    private String username;
    
    @Schema(description = "用户真实姓名", example = "张三")
    private String userRealName;
    
    @Schema(description = "部门ID", example = "1")
    private Long departmentId;
    
    @Schema(description = "部门名称", example = "技术部")
    private String departmentName;
    
    @Schema(description = "部门编码", example = "TECH")
    private String departmentCode;
    
    @Schema(description = "职位", example = "软件工程师")
    private String position;
    
    @Schema(description = "是否为主要部门", example = "true")
    private Boolean isPrimary;
    
    @Schema(description = "状态", example = "1", allowableValues = {"0", "1", "2"})
    private Integer status;
    
    @Schema(description = "生效日期", example = "2024-01-01")
    private LocalDate startDate;
    
    @Schema(description = "失效日期", example = "2024-12-31")
    private LocalDate endDate;
    
    @Schema(description = "创建时间", example = "2024-01-01T10:00:00")
    private LocalDateTime createdTime;
    
    @Schema(description = "更新时间", example = "2024-01-01T10:00:00")
    private LocalDateTime updatedTime;
    
    @Schema(description = "是否当前激活", example = "true")
    private Boolean active;
    
    @Schema(description = "是否已过期", example = "false")
    private Boolean expired;
    
    @Schema(description = "是否为未来生效", example = "false")
    private Boolean future;
}
