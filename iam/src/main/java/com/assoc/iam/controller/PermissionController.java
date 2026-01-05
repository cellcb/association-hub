package com.assoc.iam.controller;

import com.assoc.common.Result;
import com.assoc.iam.dto.PermissionRequest;
import com.assoc.iam.dto.PermissionResponse;
import com.assoc.iam.service.PermissionService;
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

@Slf4j
@RestController
@RequestMapping("/api/iam/permissions")
@RequiredArgsConstructor
@Tag(name = "权限管理", description = "权限CRUD操作相关接口（原路径：/api/permissions）")
@SecurityRequirement(name = "Bearer Authentication")
public class PermissionController {
    
    private final PermissionService permissionService;
    
    @Operation(
        summary = "创建权限",
        description = "创建新的权限",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "创建成功",
                content = @Content(schema = @Schema(implementation = PermissionResponse.class))
            ),
            @ApiResponse(
                responseCode = "400", 
                description = "请求参数错误"
            )
        }
    )
    @PostMapping
    public Result<PermissionResponse> createPermission(
        @Parameter(description = "权限创建请求信息", required = true)
        @Valid @RequestBody PermissionRequest request) {
        try {
            PermissionResponse response = permissionService.createPermission(request);
            return Result.success("权限创建成功", response);
        } catch (Exception e) {
            log.error("Create permission failed: {}", e.getMessage());
            return Result.error(400, e.getMessage());
        }
    }
    
    @Operation(
        summary = "获取权限详情",
        description = "根据ID获取权限详细信息",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "获取成功",
                content = @Content(schema = @Schema(implementation = PermissionResponse.class))
            ),
            @ApiResponse(
                responseCode = "404", 
                description = "权限不存在"
            )
        }
    )
    @GetMapping("/{id}")
    public Result<PermissionResponse> getPermissionById(
        @Parameter(description = "权限ID", required = true)
        @PathVariable Long id) {
        try {
            PermissionResponse response = permissionService.getPermissionById(id);
            return Result.success("获取权限成功", response);
        } catch (Exception e) {
            log.error("Get permission failed for id: {}, error: {}", id, e.getMessage());
            return Result.error(404, e.getMessage());
        }
    }
    
    @Operation(
        summary = "获取权限列表",
        description = "分页获取权限列表",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "获取成功"
            )
        }
    )
    @GetMapping
    public Result<Page<PermissionResponse>> getAllPermissions(
        @Parameter(description = "分页参数", hidden = true)
        @PageableDefault(size = 20) Pageable pageable) {
        try {
            Page<PermissionResponse> response = permissionService.getAllPermissions(pageable);
            return Result.success("获取权限列表成功", response);
        } catch (Exception e) {
            log.error("Get permissions failed: {}", e.getMessage());
            return Result.error(500, e.getMessage());
        }
    }
    
    @Operation(
        summary = "更新权限",
        description = "更新权限信息",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "更新成功",
                content = @Content(schema = @Schema(implementation = PermissionResponse.class))
            ),
            @ApiResponse(
                responseCode = "400", 
                description = "请求参数错误"
            ),
            @ApiResponse(
                responseCode = "404", 
                description = "权限不存在"
            )
        }
    )
    @PutMapping("/{id}")
    public Result<PermissionResponse> updatePermission(
        @Parameter(description = "权限ID", required = true)
        @PathVariable Long id,
        @Parameter(description = "权限更新请求信息", required = true)
        @Valid @RequestBody PermissionRequest request) {
        try {
            PermissionResponse response = permissionService.updatePermission(id, request);
            return Result.success("权限更新成功", response);
        } catch (Exception e) {
            log.error("Update permission failed for id: {}, error: {}", id, e.getMessage());
            return Result.error(400, e.getMessage());
        }
    }
    
    @Operation(
        summary = "删除权限",
        description = "根据ID删除权限",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "删除成功"
            ),
            @ApiResponse(
                responseCode = "404", 
                description = "权限不存在"
            )
        }
    )
    @DeleteMapping("/{id}")
    public Result<Void> deletePermission(
        @Parameter(description = "权限ID", required = true)
        @PathVariable Long id) {
        try {
            permissionService.deletePermission(id);
            return Result.success("权限删除成功", null);
        } catch (Exception e) {
            log.error("Delete permission failed for id: {}, error: {}", id, e.getMessage());
            return Result.error(404, e.getMessage());
        }
    }
}
