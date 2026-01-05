package com.assoc.iam.controller;

import com.assoc.common.Result;
import com.assoc.common.audit.Audit;
import com.assoc.common.audit.AuditAction;
import com.assoc.iam.dto.*;
import com.assoc.iam.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
 
import org.springframework.web.bind.annotation.*;

import java.util.Set;

@Slf4j
@RestController
@RequestMapping("/api/iam/users")
@RequiredArgsConstructor
@Tag(name = "用户管理", description = "管理员用户管理接口，包括用户CRUD、角色分配等管理功能（原路径：/api/users）")
@SecurityRequirement(name = "Bearer Authentication")
public class UserController {
    
    private final UserService userService;
    
    @Operation(
        summary = "创建用户",
        description = "创建新的用户并分配角色",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "创建成功",
                content = @Content(schema = @Schema(implementation = UserResponse.class))
            ),
            @ApiResponse(
                responseCode = "400", 
                description = "请求参数错误"
            ),
            @ApiResponse(
                responseCode = "409", 
                description = "用户名或邮箱已存在"
            )
        }
    )
    @PostMapping
    @Audit(action = AuditAction.CREATE_USER, resource = "user")
    public Result<UserResponse> createUser(
        @Parameter(description = "用户创建请求信息", required = true)
        @Valid @RequestBody UserRequest request) {
        
        log.info("Creating user: {}", request.getUsername());
        UserResponse response = userService.createUser(request);
        return Result.success(response);
    }
    
    @Operation(
        summary = "根据ID获取用户信息",
        description = "根据用户ID获取详细的用户信息",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "获取成功",
                content = @Content(schema = @Schema(implementation = UserResponse.class))
            ),
            @ApiResponse(
                responseCode = "404", 
                description = "用户不存在"
            )
        }
    )
    @GetMapping("/{id}")
    
    public Result<UserResponse> getUserById(
        @Parameter(description = "用户ID", required = true, example = "1")
        @PathVariable Long id) {
        
        UserResponse response = userService.getUserById(id);
        return Result.success(response);
    }
    
    @Operation(
        summary = "根据用户名获取用户信息",
        description = "根据用户名获取详细的用户信息",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "获取成功",
                content = @Content(schema = @Schema(implementation = UserResponse.class))
            ),
            @ApiResponse(
                responseCode = "404", 
                description = "用户不存在"
            )
        }
    )
    @GetMapping("/username/{username}")
    
    public Result<UserResponse> getUserByUsername(
        @Parameter(description = "用户名", required = true, example = "admin")
        @PathVariable String username) {
        
        UserResponse response = userService.getUserByUsername(username);
        return Result.success(response);
    }
    
    @Operation(
        summary = "分页获取所有用户",
        description = "分页获取所有用户列表",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "获取成功"
            )
        }
    )
    @GetMapping
    
    public Result<Page<UserResponse>> getAllUsers(
        @PageableDefault(size = 20) Pageable pageable) {
        
        Page<UserResponse> users = userService.getAllUsers(pageable);
        return Result.success(users);
    }
    
    
    @Operation(
        summary = "搜索用户",
        description = "根据关键词搜索用户（用户名、真实姓名、邮箱）",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "搜索成功"
            )
        }
    )
    @GetMapping("/search")
    
    public Result<Page<UserResponse>> searchUsers(
        @Parameter(description = "搜索关键词", required = true, example = "张三")
        @RequestParam String keyword,
        @PageableDefault(size = 20) Pageable pageable) {
        
        Page<UserResponse> users = userService.searchUsers(keyword, pageable);
        return Result.success(users);
    }
    
    @Operation(
        summary = "更新用户信息",
        description = "更新指定用户的信息",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "更新成功",
                content = @Content(schema = @Schema(implementation = UserResponse.class))
            ),
            @ApiResponse(
                responseCode = "404", 
                description = "用户不存在"
            ),
            @ApiResponse(
                responseCode = "409", 
                description = "邮箱已被其他用户使用"
            )
        }
    )
    @PutMapping("/{id}")
    @Audit(action = AuditAction.UPDATE_USER, resource = "user")
    public Result<UserResponse> updateUser(
        @Parameter(description = "用户ID", required = true, example = "1")
        @PathVariable Long id,
        @Parameter(description = "用户更新请求信息", required = true)
        @Valid @RequestBody UserUpdateRequest request) {
        
        log.info("Updating user ID: {}", id);
        UserResponse response = userService.updateUser(id, request);
        return Result.success(response);
    }
    
    @Operation(
        summary = "修改用户密码",
        description = "管理员修改指定用户的密码",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "修改成功"
            ),
            @ApiResponse(
                responseCode = "400", 
                description = "旧密码不正确或新密码格式错误"
            ),
            @ApiResponse(
                responseCode = "404", 
                description = "用户不存在"
            )
        }
    )
    @PostMapping("/{id}/change-password")
    @Audit(action = AuditAction.UPDATE_USER, resource = "user")
    public Result<Void> changePassword(
        @Parameter(description = "用户ID", required = true, example = "1")
        @PathVariable Long id,
        @Parameter(description = "修改密码请求信息", required = true)
        @Valid @RequestBody ChangePasswordRequest request) {
        
        log.info("Changing password for user ID: {}", id);
        userService.changePassword(id, request);
        return Result.success();
    }
    
    @Operation(
        summary = "重置用户密码",
        description = "管理员重置用户密码",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "重置成功"
            ),
            @ApiResponse(
                responseCode = "404", 
                description = "用户不存在"
            )
        }
    )
    @PostMapping("/{id}/reset-password")
    @Audit(action = AuditAction.UPDATE_USER, resource = "user")
    public Result<Void> resetPassword(
        @Parameter(description = "用户ID", required = true, example = "1")
        @PathVariable Long id,
        @Parameter(description = "新密码", required = true, example = "newPassword123")
        @RequestParam String newPassword) {
        
        log.info("Resetting password for user ID: {}", id);
        userService.resetPassword(id, newPassword);
        return Result.success();
    }
    
    @Operation(
        summary = "启用用户",
        description = "启用被禁用的用户",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "启用成功"
            ),
            @ApiResponse(
                responseCode = "404", 
                description = "用户不存在"
            )
        }
    )
    @PostMapping("/{id}/enable")
    @Audit(action = AuditAction.UPDATE_USER, resource = "user")
    public Result<Void> enableUser(
        @Parameter(description = "用户ID", required = true, example = "1")
        @PathVariable Long id) {
        
        log.info("Enabling user ID: {}", id);
        userService.enableUser(id);
        return Result.success();
    }
    
    @Operation(
        summary = "禁用用户",
        description = "禁用用户账户",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "禁用成功"
            ),
            @ApiResponse(
                responseCode = "404", 
                description = "用户不存在"
            )
        }
    )
    @PostMapping("/{id}/disable")
    @Audit(action = AuditAction.UPDATE_USER, resource = "user")
    public Result<Void> disableUser(
        @Parameter(description = "用户ID", required = true, example = "1")
        @PathVariable Long id) {
        
        log.info("Disabling user ID: {}", id);
        userService.disableUser(id);
        return Result.success();
    }
    
    @Operation(
        summary = "删除用户",
        description = "删除指定的用户",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "删除成功"
            ),
            @ApiResponse(
                responseCode = "404", 
                description = "用户不存在"
            )
        }
    )
    @DeleteMapping("/{id}")
    @Audit(action = AuditAction.DELETE_USER, resource = "user")
    public Result<Void> deleteUser(
        @Parameter(description = "用户ID", required = true, example = "1")
        @PathVariable Long id) {
        
        log.info("Deleting user ID: {}", id);
        userService.deleteUser(id);
        return Result.success();
    }
    
    @Operation(
        summary = "为用户分配角色",
        description = "为指定用户分配一个或多个角色",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "分配成功"
            ),
            @ApiResponse(
                responseCode = "404", 
                description = "用户不存在"
            )
        }
    )
    @PostMapping("/{id}/roles")
    @Audit(action = AuditAction.UPDATE_USER, resource = "user")
    public Result<Void> assignRoles(
        @Parameter(description = "用户ID", required = true, example = "1")
        @PathVariable Long id,
        @Parameter(description = "角色ID列表", required = true)
        @RequestBody Set<Long> roleIds) {
        
        log.info("Assigning roles {} to user ID: {}", roleIds, id);
        userService.assignRoles(id, roleIds);
        return Result.success();
    }
    
    @Operation(
        summary = "移除用户角色",
        description = "移除指定用户的一个或多个角色",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "移除成功"
            ),
            @ApiResponse(
                responseCode = "404", 
                description = "用户不存在"
            )
        }
    )
    @DeleteMapping("/{id}/roles")
    @Audit(action = AuditAction.UPDATE_USER, resource = "user")
    public Result<Void> removeRoles(
        @Parameter(description = "用户ID", required = true, example = "1")
        @PathVariable Long id,
        @Parameter(description = "角色ID列表", required = true)
        @RequestBody Set<Long> roleIds) {
        
        log.info("Removing roles {} from user ID: {}", roleIds, id);
        userService.removeRoles(id, roleIds);
        return Result.success();
    }
    
    @Operation(
        summary = "检查用户名是否存在",
        description = "检查指定的用户名是否已被使用",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "检查完成"
            )
        }
    )
    @GetMapping("/check-username")
    
    public Result<Boolean> checkUsername(
        @Parameter(description = "用户名", required = true, example = "admin")
        @RequestParam String username) {
        
        boolean exists = userService.existsByUsername(username);
        return Result.success(exists);
    }
    
    @Operation(
        summary = "检查邮箱是否存在",
        description = "检查指定的邮箱是否已被使用",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "检查完成"
            )
        }
    )
    @GetMapping("/check-email")
    
    public Result<Boolean> checkEmail(
        @Parameter(description = "邮箱地址", required = true, example = "user@example.com")
        @RequestParam String email) {
        
        boolean exists = userService.existsByEmail(email);
        return Result.success(exists);
    }
    
    @Operation(
        summary = "获取正常用户数量",
        description = "获取状态为正常(1)的用户总数",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "获取成功"
            )
        }
    )
    @GetMapping("/count/active")
    
    public Result<Long> getActiveUserCount() {
        long count = userService.countActiveUsers();
        return Result.success(count);
    }
    
    @Operation(
        summary = "获取禁用用户数量",
        description = "获取状态为禁用(0)的用户总数",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "获取成功"
            )
        }
    )
    @GetMapping("/count/disabled")
    public Result<Long> getDisabledUserCount() {
        long count = userService.countDisabledUsers();
        return Result.success(count);
    }
    
    @Operation(
        summary = "根据状态获取用户数量",
        description = "根据指定的状态码获取用户总数",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "获取成功"
            )
        }
    )
    @GetMapping("/count/by-status")
    public Result<Long> getUserCountByStatus(
        @Parameter(description = "用户状态", required = true, example = "1")
        @RequestParam Integer status) {
        
        long count = userService.countByStatus(status);
        return Result.success(count);
    }
}
