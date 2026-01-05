package com.assoc.iam.controller;

import com.assoc.common.Result;
import com.assoc.common.audit.Audit;
import com.assoc.common.audit.AuditAction;
import com.assoc.iam.dto.RoleRequest;
import com.assoc.iam.dto.RoleResponse;
import com.assoc.iam.dto.RolePermissionRequest;
import com.assoc.iam.dto.PermissionResponse;
import com.assoc.iam.service.RoleService;
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
@RequestMapping("/api/iam/roles")
@RequiredArgsConstructor
@Tag(name = "角色管理", description = "角色CRUD操作相关接口（原路径：/api/roles）")
@SecurityRequirement(name = "Bearer Authentication")
public class RoleController {
    
    private final RoleService roleService;
    
    @Operation(
        summary = "创建角色",
        description = "创建新的角色并分配权限",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "创建成功",
                content = @Content(schema = @Schema(implementation = RoleResponse.class))
            ),
            @ApiResponse(
                responseCode = "400", 
                description = "请求参数错误"
            )
        }
    )
    @PostMapping
    @Audit(action = AuditAction.CREATE_ROLE, resource = "role")
    public Result<RoleResponse> createRole(
        @Parameter(description = "角色创建请求信息", required = true)
        @Valid @RequestBody RoleRequest request) {
        try {
            RoleResponse response = roleService.createRole(request);
            return Result.success("角色创建成功", response);
        } catch (Exception e) {
            log.error("Create role failed: {}", e.getMessage());
            return Result.error(400, e.getMessage());
        }
    }
    
    @Operation(
        summary = "获取角色详情",
        description = "根据ID获取角色详细信息",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "获取成功",
                content = @Content(schema = @Schema(implementation = RoleResponse.class))
            ),
            @ApiResponse(
                responseCode = "404", 
                description = "角色不存在"
            )
        }
    )
    @GetMapping("/{id}")
    public Result<RoleResponse> getRoleById(
        @Parameter(description = "角色ID", required = true)
        @PathVariable Long id) {
        try {
            RoleResponse response = roleService.getRoleById(id);
            return Result.success("获取角色成功", response);
        } catch (Exception e) {
            log.error("Get role failed for id: {}, error: {}", id, e.getMessage());
            return Result.error(404, e.getMessage());
        }
    }
    
    @Operation(
        summary = "获取角色列表",
        description = "分页获取角色列表",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "获取成功"
            )
        }
    )
    @GetMapping
    public Result<Page<RoleResponse>> getAllRoles(
        @Parameter(description = "分页参数", hidden = true)
        @PageableDefault(size = 20) Pageable pageable) {
        try {
            Page<RoleResponse> response = roleService.getAllRoles(pageable);
            return Result.success("获取角色列表成功", response);
        } catch (Exception e) {
            log.error("Get roles failed: {}", e.getMessage());
            return Result.error(500, e.getMessage());
        }
    }
    
    @Operation(
        summary = "更新角色",
        description = "更新角色信息和权限",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "更新成功",
                content = @Content(schema = @Schema(implementation = RoleResponse.class))
            ),
            @ApiResponse(
                responseCode = "400", 
                description = "请求参数错误"
            ),
            @ApiResponse(
                responseCode = "404", 
                description = "角色不存在"
            )
        }
    )
    @PutMapping("/{id}")
    @Audit(action = AuditAction.UPDATE_ROLE, resource = "role")
    public Result<RoleResponse> updateRole(
        @Parameter(description = "角色ID", required = true)
        @PathVariable Long id,
        @Parameter(description = "角色更新请求信息", required = true)
        @Valid @RequestBody RoleRequest request) {
        try {
            RoleResponse response = roleService.updateRole(id, request);
            return Result.success("角色更新成功", response);
        } catch (Exception e) {
            log.error("Update role failed for id: {}, error: {}", id, e.getMessage());
            return Result.error(400, e.getMessage());
        }
    }
    
    @Operation(
        summary = "删除角色",
        description = "根据ID删除角色",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "删除成功"
            ),
            @ApiResponse(
                responseCode = "404", 
                description = "角色不存在"
            )
        }
    )
    @DeleteMapping("/{id}")
    @Audit(action = AuditAction.DELETE_ROLE, resource = "role")
    public Result<Void> deleteRole(
        @Parameter(description = "角色ID", required = true)
        @PathVariable Long id) {
        try {
            roleService.deleteRole(id);
            return Result.success("角色删除成功", null);
        } catch (Exception e) {
            log.error("Delete role failed for id: {}, error: {}", id, e.getMessage());
            return Result.error(404, e.getMessage());
        }
    }
    
    @Operation(
        summary = "设置角色权限",
        description = "为角色设置权限（替换现有权限）",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "设置成功",
                content = @Content(schema = @Schema(implementation = RoleResponse.class))
            ),
            @ApiResponse(
                responseCode = "400", 
                description = "请求参数错误"
            ),
            @ApiResponse(
                responseCode = "404", 
                description = "角色不存在"
            )
        }
    )
    @PutMapping("/{id}/permissions")
    @Audit(action = AuditAction.UPDATE_ROLE, resource = "role")
    public Result<RoleResponse> assignPermissions(
        @Parameter(description = "角色ID", required = true)
        @PathVariable("id") Long id,
        @Parameter(description = "权限ID列表", required = true)
        @Valid @RequestBody RolePermissionRequest request) {
        try {
            // Execute update but do not return role info on success
            roleService.assignPermissionsToRole(id, request.getPermissionIds());
            return Result.success("角色权限设置成功", null);
        } catch (Exception e) {
            log.error("Assign permissions to role failed for id: {}, error: {}", id, e.getMessage());
            return Result.error(400, e.getMessage());
        }
    }
    
    @Operation(
        summary = "添加角色权限",
        description = "为角色添加新权限（保留现有权限）",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "添加成功",
                content = @Content(schema = @Schema(implementation = RoleResponse.class))
            ),
            @ApiResponse(
                responseCode = "400", 
                description = "请求参数错误"
            ),
            @ApiResponse(
                responseCode = "404", 
                description = "角色不存在"
            )
        }
    )
    @PostMapping("/{id}/permissions")
    public Result<RoleResponse> addPermissions(
        @Parameter(description = "角色ID", required = true)
        @PathVariable Long id,
        @Parameter(description = "权限ID列表", required = true)
        @Valid @RequestBody RolePermissionRequest request) {
        try {
            // Execute update but do not return role info on success
            roleService.addPermissionsToRole(id, request.getPermissionIds());
            return Result.success("角色权限添加成功", null);
        } catch (Exception e) {
            log.error("Add permissions to role failed for id: {}, error: {}", id, e.getMessage());
            return Result.error(400, e.getMessage());
        }
    }
    
    @Operation(
        summary = "移除角色权限",
        description = "从角色中移除指定权限",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "移除成功",
                content = @Content(schema = @Schema(implementation = RoleResponse.class))
            ),
            @ApiResponse(
                responseCode = "400", 
                description = "请求参数错误"
            ),
            @ApiResponse(
                responseCode = "404", 
                description = "角色不存在"
            )
        }
    )
    @DeleteMapping("/{id}/permissions")
    public Result<RoleResponse> removePermissions(
        @Parameter(description = "角色ID", required = true)
        @PathVariable Long id,
        @Parameter(description = "权限ID列表", required = true)
        @Valid @RequestBody RolePermissionRequest request) {
        try {
            // Execute update but do not return role info on success
            roleService.removePermissionsFromRole(id, request.getPermissionIds());
            return Result.success("角色权限移除成功", null);
        } catch (Exception e) {
            log.error("Remove permissions from role failed for id: {}, error: {}", id, e.getMessage());
            return Result.error(400, e.getMessage());
        }
    }
    
    @Operation(
        summary = "获取角色权限",
        description = "获取角色拥有的所有权限",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "获取成功"
            ),
            @ApiResponse(
                responseCode = "404", 
                description = "角色不存在"
            )
        }
    )
    @GetMapping("/{id}/permissions")
    public Result<Set<PermissionResponse>> getRolePermissions(
        @Parameter(description = "角色ID", required = true)
        @PathVariable Long id) {
        try {
            Set<PermissionResponse> permissions = roleService.getRolePermissions(id);
            return Result.success("获取角色权限成功", permissions);
        } catch (Exception e) {
            log.error("Get role permissions failed for id: {}, error: {}", id, e.getMessage());
            return Result.error(404, e.getMessage());
        }
    }
}
