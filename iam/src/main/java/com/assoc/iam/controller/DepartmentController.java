package com.assoc.iam.controller;

import com.assoc.common.Result;
import com.assoc.iam.dto.DepartmentRequest;
import com.assoc.iam.dto.DepartmentResponse;
import com.assoc.iam.dto.DepartmentTreeResponse;
import com.assoc.iam.service.DepartmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
 
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Tag(name = "部门管理", description = "部门管理相关接口，包括部门的增删改查、树形结构查询、搜索和移动操作（原路径：/api/departments）")
@RestController
@RequestMapping("/api/iam/departments")
@RequiredArgsConstructor
public class DepartmentController {
    
    private final DepartmentService departmentService;
    
    @Operation(
        summary = "获取部门树", 
        description = "获取完整的部门树形结构，包含所有部门的层级关系。返回的树形结构可用于前端展示部门组织架构。"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200", 
            description = "成功获取部门树",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = Result.class)
            )
        ),
        @ApiResponse(
            responseCode = "403", 
            description = "权限不足，需要DEPARTMENT_READ权限",
            content = @Content
        )
    })
    @GetMapping("/tree")
    public Result<List<DepartmentTreeResponse>> getDepartmentTree() {
        List<DepartmentTreeResponse> tree = departmentService.getDepartmentTree();
        return Result.success(tree);
    }
    
    @Operation(
        summary = "获取所有部门", 
        description = "获取所有部门的平铺列表，不包含层级关系。适用于下拉选择框等场景。"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200", 
            description = "成功获取部门列表",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = Result.class)
            )
        ),
        @ApiResponse(
            responseCode = "403", 
            description = "权限不足，需要DEPARTMENT_READ权限",
            content = @Content
        )
    })
    @GetMapping
    
    public Result<List<DepartmentResponse>> getAllDepartments() {
        List<DepartmentResponse> departments = departmentService.getAllDepartments();
        return Result.success(departments);
    }
    
    @Operation(
        summary = "根据ID获取部门", 
        description = "根据部门ID获取部门的详细信息，包括部门名称、编码、描述等完整信息。"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200", 
            description = "成功获取部门信息",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = Result.class)
            )
        ),
        @ApiResponse(
            responseCode = "404", 
            description = "部门不存在",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = Result.class)
            )
        ),
        @ApiResponse(
            responseCode = "403", 
            description = "权限不足，需要DEPARTMENT_READ权限",
            content = @Content
        )
    })
    @GetMapping("/{id}")
    public Result<DepartmentResponse> getDepartmentById(
            @Parameter(
                description = "部门ID，必须是有效的数字", 
                required = true,
                example = "1"
            ) @PathVariable Long id) {
        return departmentService.getDepartmentById(id)
                .map(department -> Result.success(department))
                .orElse(Result.error(404, "部门不存在"));
    }
    
    @Operation(
        summary = "根据编码获取部门", 
        description = "根据部门编码获取部门详细信息。部门编码是部门的唯一标识符。"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200", 
            description = "成功获取部门信息",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = Result.class)
            )
        ),
        @ApiResponse(
            responseCode = "404", 
            description = "部门不存在",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = Result.class)
            )
        ),
        @ApiResponse(
            responseCode = "403", 
            description = "权限不足，需要DEPARTMENT_READ权限",
            content = @Content
        )
    })
    @GetMapping("/code/{code}")
    public Result<DepartmentResponse> getDepartmentByCode(
            @Parameter(
                description = "部门编码，不能为空", 
                required = true,
                example = "DEPT001"
            ) @PathVariable String code) {
        return departmentService.getDepartmentByCode(code)
                .map(department -> Result.success(department))
                .orElse(Result.error(404, "部门不存在"));
    }
    
    @Operation(
        summary = "获取子部门", 
        description = "根据父部门ID获取直接子部门列表，不包含孙部门。用于懒加载部门树。"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200", 
            description = "成功获取子部门列表",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = Result.class)
            )
        ),
        @ApiResponse(
            responseCode = "403", 
            description = "权限不足，需要DEPARTMENT_READ权限",
            content = @Content
        )
    })
    @GetMapping("/{parentId}/children")
    public Result<List<DepartmentResponse>> getChildrenByParentId(
            @Parameter(
                description = "父部门ID，必须是有效的数字", 
                required = true,
                example = "1"
            ) @PathVariable Long parentId) {
        List<DepartmentResponse> children = departmentService.getChildrenByParentId(parentId);
        return Result.success(children);
    }
    
    @Operation(
        summary = "搜索部门", 
        description = "根据部门名称进行模糊搜索，支持部分匹配。返回匹配的部门列表。"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200", 
            description = "成功获取搜索结果",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = Result.class)
            )
        ),
        @ApiResponse(
            responseCode = "403", 
            description = "权限不足，需要DEPARTMENT_READ权限",
            content = @Content
        )
    })
    @GetMapping("/search")
    public Result<List<DepartmentResponse>> searchDepartments(
            @Parameter(
                description = "搜索关键词，支持部门名称的模糊匹配", 
                required = true,
                example = "技术"
            ) @RequestParam String name) {
        List<DepartmentResponse> departments = departmentService.searchDepartments(name);
        return Result.success(departments);
    }
    
    @Operation(
        summary = "创建部门", 
        description = "创建新的部门。部门编码必须全局唯一，部门名称在同级部门中必须唯一。"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200", 
            description = "部门创建成功",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = Result.class)
            )
        ),
        @ApiResponse(
            responseCode = "400", 
            description = "请求参数错误或部门信息不合法",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = Result.class)
            )
        ),
        @ApiResponse(
            responseCode = "403", 
            description = "权限不足，需要DEPARTMENT_CREATE权限",
            content = @Content
        )
    })
    @PostMapping
    public Result<DepartmentResponse> createDepartment(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                description = "部门创建请求参数",
                required = true,
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = DepartmentRequest.class)
                )
            )
            @Valid @RequestBody DepartmentRequest request) {
        try {
            DepartmentResponse department = departmentService.createDepartment(request);
            return Result.success("部门创建成功", department);
        } catch (IllegalArgumentException e) {
            return Result.error(400, e.getMessage());
        }
    }
    
    @Operation(
        summary = "更新部门", 
        description = "更新指定部门的信息。部门编码和名称在更新后仍需保持唯一性。"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200", 
            description = "部门更新成功",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = Result.class)
            )
        ),
        @ApiResponse(
            responseCode = "400", 
            description = "请求参数错误或部门信息不合法",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = Result.class)
            )
        ),
        @ApiResponse(
            responseCode = "403", 
            description = "权限不足，需要DEPARTMENT_UPDATE权限",
            content = @Content
        )
    })
    @PutMapping("/{id}")
    public Result<DepartmentResponse> updateDepartment(
            @Parameter(
                description = "部门ID，必须是有效的数字", 
                required = true,
                example = "1"
            ) @PathVariable Long id,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                description = "部门更新请求参数",
                required = true,
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = DepartmentRequest.class)
                )
            )
            @Valid @RequestBody DepartmentRequest request) {
        try {
            DepartmentResponse department = departmentService.updateDepartment(id, request);
            return Result.success("部门更新成功", department);
        } catch (IllegalArgumentException e) {
            return Result.error(400, e.getMessage());
        }
    }
    
    @Operation(
        summary = "删除部门", 
        description = "删除指定的部门。注意：如果部门下有子部门或用户，则不能删除。"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200", 
            description = "部门删除成功",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = Result.class)
            )
        ),
        @ApiResponse(
            responseCode = "400", 
            description = "无法删除，部门下存在子部门或用户",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = Result.class)
            )
        ),
        @ApiResponse(
            responseCode = "403", 
            description = "权限不足，需要DEPARTMENT_DELETE权限",
            content = @Content
        )
    })
    @DeleteMapping("/{id}")
    public Result<Void> deleteDepartment(
            @Parameter(
                description = "部门ID，必须是有效的数字", 
                required = true,
                example = "1"
            ) @PathVariable Long id) {
        try {
            departmentService.deleteDepartment(id);
            return Result.success();
        } catch (IllegalArgumentException e) {
            return Result.error(400, e.getMessage());
        }
    }
    
    @Operation(
        summary = "移动部门", 
        description = "将部门移动到新的父部门下，调整部门的层级关系。不能将部门移动到自己或自己的子部门下。"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200", 
            description = "部门移动成功",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = Result.class)
            )
        ),
        @ApiResponse(
            responseCode = "400", 
            description = "移动操作不合法，如循环引用或参数错误",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = Result.class)
            )
        ),
        @ApiResponse(
            responseCode = "403", 
            description = "权限不足，需要DEPARTMENT_UPDATE权限",
            content = @Content
        )
    })
    @PatchMapping("/{id}/move")
    public Result<Void> moveDepartment(
            @Parameter(
                description = "要移动的部门ID，必须是有效的数字", 
                required = true,
                example = "1"
            ) @PathVariable Long id,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                description = "移动请求参数，包含新的父部门ID",
                required = true,
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(
                        example = "{\"newParentId\": 2}"
                    )
                )
            )
            @RequestBody Map<String, Long> request) {
        try {
            Long newParentId = request.get("newParentId");
            departmentService.moveDepartment(id, newParentId);
            return Result.success();
        } catch (IllegalArgumentException e) {
            return Result.error(400, e.getMessage());
        }
    }
}
