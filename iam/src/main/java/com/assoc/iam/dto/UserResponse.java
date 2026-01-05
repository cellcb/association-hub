package com.assoc.iam.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Data
@Schema(description = "用户响应信息")
public class UserResponse {
    
    @Schema(description = "用户ID", example = "1")
    private Long id;
    
    @Schema(description = "用户名", example = "zhangsan")
    private String username;
    
    @Schema(description = "邮箱", example = "zhangsan@example.com")
    private String email;
    
    @Schema(description = "手机号", example = "13800138000")
    private String phone;
    
    @Schema(description = "真实姓名", example = "张三")
    private String realName;
    
    @Schema(description = "状态", example = "1")
    private Integer status;
    
    @Schema(description = "最后登录时间")
    private LocalDateTime lastLoginTime;
    
    @Schema(description = "创建时间")
    private LocalDateTime createdTime;
    
    @Schema(description = "更新时间")
    private LocalDateTime updatedTime;
    
    @Schema(description = "创建人ID")
    private Long createdBy;
    
    @Schema(description = "更新人ID")
    private Long updatedBy;
    
    
    @Schema(description = "部门名称")
    private String departmentName;
    
    @Schema(description = "角色列表")
    private Set<RoleResponse> roles;
    
    @Schema(description = "角色代码列表")
    private List<String> roleCodes;
    
    @Schema(description = "权限代码列表")
    private List<String> permissionCodes;
    
    @Schema(description = "用户部门关系列表")
    private List<UserDepartmentResponse> departments;
    
    @Schema(description = "主要部门信息")
    private UserDepartmentResponse primaryDepartment;
}
