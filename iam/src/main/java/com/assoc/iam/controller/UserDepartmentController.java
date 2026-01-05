package com.assoc.iam.controller;

import com.assoc.common.Result;
import com.assoc.iam.dto.*;
import com.assoc.iam.service.UserDepartmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "用户部门关系管理", description = "提供用户与部门之间多对多关系的完整管理功能，支持职位管理、主要部门设置、有效期控制等高级特性（原路径：/api/user-departments）")
@RestController
@RequestMapping("/api/iam")
@RequiredArgsConstructor
@Slf4j
public class UserDepartmentController {
    
    private final UserDepartmentService userDepartmentService;
    
    @Operation(
        summary = "创建用户部门关系", 
        description = "为用户分配新的部门关系，可以指定职位、是否为主要部门、生效时间等。如果设置为主要部门，将自动清除该用户的其他主要部门标记。"
    )
    @PostMapping("/users/{userId}/departments")
    public Result<UserDepartmentResponse> createUserDepartment(
            @Parameter(description = "用户的唯一标识ID", required = true, example = "1") @PathVariable Long userId,
            @Valid @RequestBody UserDepartmentRequest request) {
        
        request.setUserId(userId);
        
        log.info("Creating user-department relationship: userId={}, departmentId={}", 
                request.getUserId(), request.getDepartmentId());
        
        UserDepartmentResponse response = userDepartmentService.createUserDepartment(request);
        return Result.success(response);
    }
    
    @Operation(
        summary = "更新用户部门关系", 
        description = "修改已存在的用户部门关系信息，包括职位调整、主要部门变更、状态修改和有效期调整。只需提供需要修改的字段。"
    )
    @PutMapping("/user-departments/{id}")
    public Result<UserDepartmentResponse> updateUserDepartment(
            @Parameter(description = "用户部门关系的唯一标识ID", required = true, example = "1") @PathVariable Long id,
            @Valid @RequestBody UserDepartmentUpdateRequest request) {
        
        log.info("Updating user-department relationship: id={}", id);
        
        UserDepartmentResponse response = userDepartmentService.updateUserDepartment(id, request);
        return Result.success(response);
    }
    
    @Operation(
        summary = "删除用户部门关系", 
        description = "永久删除指定的用户部门关系记录。注意：此操作不可逆，建议使用停用功能代替物理删除。"
    )
    @DeleteMapping("/user-departments/{id}")
    public Result<Void> deleteUserDepartment(
            @Parameter(description = "用户部门关系的唯一标识ID", required = true, example = "1") @PathVariable Long id) {
        
        log.info("Deleting user-department relationship: id={}", id);
        
        userDepartmentService.deleteUserDepartment(id);
        return Result.success();
    }
    
    @Operation(
        summary = "获取用户部门关系详情", 
        description = "根据关系ID获取用户部门关系的详细信息，包括用户信息、部门信息、职位、状态和有效期等完整数据。"
    )
    @GetMapping("/user-departments/{id}")
    public Result<UserDepartmentResponse> getUserDepartment(
            @Parameter(description = "用户部门关系的唯一标识ID", required = true, example = "1") @PathVariable Long id) {
        
        UserDepartmentResponse response = userDepartmentService.getUserDepartment(id);
        return Result.success(response);
    }
    
    @Operation(
        summary = "获取用户的所有部门关系", 
        description = "获取指定用户的全部部门关系记录，包括当前活跃的、已过期的和未来生效的关系。用于查看用户的完整部门履历。"
    )
    @GetMapping("/users/{userId}/departments")
    public Result<List<UserDepartmentResponse>> getUserDepartments(
            @Parameter(description = "用户的唯一标识ID", required = true, example = "1") @PathVariable Long userId) {
        
        List<UserDepartmentResponse> responses = userDepartmentService.getUserDepartmentsByUserId(userId);
        return Result.success(responses);
    }
    
    @Operation(
        summary = "获取用户的当前活跃部门关系", 
        description = "获取指定用户当前正在生效的部门关系，只返回状态为活跃且在有效期内的关系记录。这是最常用的用户部门查询接口。"
    )
    @GetMapping("/users/{userId}/departments/active")
    public Result<List<UserDepartmentResponse>> getActiveUserDepartments(
            @Parameter(description = "用户的唯一标识ID", required = true, example = "1") @PathVariable Long userId) {
        
        List<UserDepartmentResponse> responses = userDepartmentService.getActiveUserDepartmentsByUserId(userId);
        return Result.success(responses);
    }
    
    @Operation(
        summary = "获取用户的主要部门", 
        description = "获取用户当前的主要部门关系。每个用户只能有一个主要部门，通常用于确定用户的主要工作归属和权限范围。如果用户没有主要部门则返回null。"
    )
    @GetMapping("/users/{userId}/departments/primary")
    public Result<UserDepartmentResponse> getUserPrimaryDepartment(
            @Parameter(description = "用户的唯一标识ID", required = true, example = "1") @PathVariable Long userId) {
        
        UserDepartmentResponse response = userDepartmentService.getUserPrimaryDepartment(userId);
        return Result.success(response);
    }
    
    @Operation(
        summary = "设置用户主要部门", 
        description = "将用户在指定部门的关系设置为主要部门。系统会自动清除该用户在其他部门的主要部门标记，确保每个用户只有一个主要部门。前提条件：用户必须已经属于该部门且关系处于活跃状态。"
    )
    @PutMapping("/users/{userId}/departments/{departmentId}/primary")
    public Result<UserDepartmentResponse> setUserPrimaryDepartment(
            @Parameter(description = "用户的唯一标识ID", required = true, example = "1") @PathVariable Long userId,
            @Parameter(description = "要设为主要部门的部门ID", required = true, example = "2") @PathVariable Long departmentId) {
        
        log.info("Setting primary department for user: userId={}, departmentId={}", userId, departmentId);
        
        UserDepartmentResponse response = userDepartmentService.setUserPrimaryDepartment(userId, departmentId);
        return Result.success(response);
    }
    
    @Operation(
        summary = "获取部门的所有用户关系", 
        description = "获取指定部门的全部用户关系记录，包括当前在职的、已离职的和未来入职的用户。用于查看部门的完整人员变更历史。"
    )
    @GetMapping("/departments/{departmentId}/users")
    public Result<List<UserDepartmentResponse>> getDepartmentUsers(
            @Parameter(description = "部门的唯一标识ID", required = true, example = "2") @PathVariable Long departmentId) {
        
        List<UserDepartmentResponse> responses = userDepartmentService.getUserDepartmentsByDepartmentId(departmentId);
        return Result.success(responses);
    }
    
    @Operation(
        summary = "获取部门的当前在职用户", 
        description = "获取指定部门当前正在生效的用户关系，只返回状态为活跃且在有效期内的用户。这是查询部门当前人员的主要接口。"
    )
    @GetMapping("/departments/{departmentId}/users/active")
    public Result<List<UserDepartmentResponse>> getActiveDepartmentUsers(
            @Parameter(description = "部门的唯一标识ID", required = true, example = "2") @PathVariable Long departmentId) {
        
        List<UserDepartmentResponse> responses = userDepartmentService.getActiveUserDepartmentsByDepartmentId(departmentId);
        return Result.success(responses);
    }
    
    @Operation(
        summary = "快速添加用户到部门", 
        description = "便捷方式将用户添加到指定部门，可以通过URL参数直接设置职位和主要部门标识。关系将从当前日期开始生效，状态默认为活跃。"
    )
    @PostMapping("/users/{userId}/departments/{departmentId}")
    public Result<UserDepartmentResponse> addUserToDepartment(
            @Parameter(description = "用户的唯一标识ID", required = true, example = "1") @PathVariable Long userId,
            @Parameter(description = "部门的唯一标识ID", required = true, example = "2") @PathVariable Long departmentId,
            @Parameter(description = "用户在该部门的职位名称", required = false, example = "软件工程师") @RequestParam(required = false) String position,
            @Parameter(description = "是否设置为用户的主要部门", required = false, example = "true") @RequestParam(defaultValue = "false") Boolean isPrimary) {
        
        log.info("Adding user to department: userId={}, departmentId={}, position={}, isPrimary={}", 
                userId, departmentId, position, isPrimary);
        
        UserDepartmentResponse response = userDepartmentService.addUserToDepartment(userId, departmentId, position, isPrimary);
        return Result.success(response);
    }
    
    @Operation(
        summary = "从部门移除用户", 
        description = "将用户从指定部门中移除，通过停用关系实现（设置结束时间为当前日期）。这种方式保留了历史记录，比直接删除更安全。"
    )
    @DeleteMapping("/users/{userId}/departments/{departmentId}")
    public Result<Void> removeUserFromDepartment(
            @Parameter(description = "用户的唯一标识ID", required = true, example = "1") @PathVariable Long userId,
            @Parameter(description = "部门的唯一标识ID", required = true, example = "2") @PathVariable Long departmentId) {
        
        log.info("Removing user from department: userId={}, departmentId={}", userId, departmentId);
        
        userDepartmentService.removeUserFromDepartment(userId, departmentId);
        return Result.success();
    }
    
    @Operation(
        summary = "用户部门调动", 
        description = "执行用户的部门调动操作，自动停用原部门关系并创建新部门关系。如果原关系是主要部门，新关系也会自动设置为主要部门，确保调动的连续性。"
    )
    @PostMapping("/users/{userId}/departments/transfer")
    public Result<UserDepartmentResponse> transferUserToDepartment(
            @Parameter(description = "被调动用户的ID", required = true, example = "1") @PathVariable Long userId,
            @Parameter(description = "调出部门的ID", required = true, example = "2") @RequestParam Long fromDepartmentId,
            @Parameter(description = "调入部门的ID", required = true, example = "3") @RequestParam Long toDepartmentId,
            @Parameter(description = "用户在新部门的职位", required = false, example = "高级软件工程师") @RequestParam(required = false) String position) {
        
        log.info("Transferring user: userId={}, from={}, to={}, position={}", 
                userId, fromDepartmentId, toDepartmentId, position);
        
        UserDepartmentResponse response = userDepartmentService.transferUserToDepartment(
                userId, fromDepartmentId, toDepartmentId, position);
        return Result.success(response);
    }
    
    @Operation(
        summary = "批量创建用户部门关系", 
        description = "一次性创建多个用户部门关系，适用于新员工入职、部门重组等场景。支持设置是否覆盖现有关系，所有关系将按照事务方式处理（全部成功或全部失败）。"
    )
    @PostMapping("/user-departments/batch")
    public Result<List<UserDepartmentResponse>> batchCreateUserDepartments(
            @Valid @RequestBody BatchUserDepartmentRequest request) {
        
        log.info("Batch creating user-department relationships: count={}", request.getRelationships().size());
        
        List<UserDepartmentResponse> responses = userDepartmentService.batchCreateUserDepartments(request);
        return Result.success(responses);
    }
    
    @Operation(
        summary = "按职位查询部门用户", 
        description = "获取指定部门中担任特定职位的所有当前在职用户，用于按职位进行人员管理和统计。只返回活跃状态且在有效期内的关系。"
    )
    @GetMapping("/departments/{departmentId}/positions/{position}/users")
    public Result<List<UserDepartmentResponse>> getUsersByPosition(
            @Parameter(description = "部门的唯一标识ID", required = true, example = "2") @PathVariable Long departmentId,
            @Parameter(description = "职位名称，需要完全匹配", required = true, example = "软件工程师") @PathVariable String position) {
        
        List<UserDepartmentResponse> responses = userDepartmentService.getUsersByPositionInDepartment(departmentId, position);
        return Result.success(responses);
    }
    
    @Operation(
        summary = "统计部门用户数量", 
        description = "获取指定部门当前活跃用户的数量统计，只计算状态为活跃且在有效期内的用户关系。用于部门人员规模统计和报表展示。"
    )
    @GetMapping("/departments/{departmentId}/users/count")
    public Result<Long> getDepartmentUserCount(
            @Parameter(description = "部门的唯一标识ID", required = true, example = "2") @PathVariable Long departmentId) {
        
        long count = userDepartmentService.getDepartmentUserCount(departmentId);
        return Result.success(count);
    }
    
    @Operation(
        summary = "检查用户部门归属", 
        description = "验证指定用户是否当前属于指定部门，只有状态为活跃且在有效期内的关系才返回true。常用于权限验证和业务逻辑判断。"
    )
    @GetMapping("/users/{userId}/departments/{departmentId}/exists")
    public Result<Boolean> checkUserInDepartment(
            @Parameter(description = "用户的唯一标识ID", required = true, example = "1") @PathVariable Long userId,
            @Parameter(description = "部门的唯一标识ID", required = true, example = "2") @PathVariable Long departmentId) {
        
        boolean exists = userDepartmentService.isUserInDepartment(userId, departmentId);
        return Result.success(exists);
    }
    
    @Operation(
        summary = "获取部门树的所有用户ID", 
        description = "获取指定部门及其所有子部门中的当前活跃用户ID列表。使用部门路径进行层级查询，适用于跨级别的用户统计和批量操作。"
    )
    @GetMapping("/departments/{departmentId}/tree/users")
    public Result<List<Long>> getUserIdsInDepartmentTree(
            @Parameter(description = "根部门的唯一标识ID，将包含其所有子部门", required = true, example = "1") @PathVariable Long departmentId) {
        
        List<Long> userIds = userDepartmentService.getUserIdsInDepartmentTree(departmentId);
        return Result.success(userIds);
    }
    
    @Operation(
        summary = "处理过期关系", 
        description = "系统维护功能：批量处理所有已过期的用户部门关系，将其状态设置为非活跃。建议定期执行此操作以保持数据一致性。返回处理的关系数量。"
    )
    @PostMapping("/user-departments/process-expired")
    public Result<Integer> processExpiredRelationships() {
        
        log.info("Processing expired user-department relationships");
        
        int count = userDepartmentService.processExpiredRelationships();
        return Result.success(count);
    }
}
