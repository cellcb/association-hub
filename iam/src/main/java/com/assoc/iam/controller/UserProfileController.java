package com.assoc.iam.controller;

import com.assoc.common.Result;
import com.assoc.iam.dto.*;
import com.assoc.iam.security.UserPrincipal;
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
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/iam/users/me")
@RequiredArgsConstructor
@Tag(name = "用户个人档案", description = "用户自服务接口，用于管理个人信息（原路径：/api/profile）")
@SecurityRequirement(name = "Bearer Authentication")
public class UserProfileController {
    
    private final UserService userService;
    
    @Operation(
        summary = "获取个人信息",
        description = "获取当前登录用户的个人档案信息",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "获取成功",
                content = @Content(schema = @Schema(implementation = UserProfileResponse.class))
            )
        }
    )
    @GetMapping
    public Result<UserProfileResponse> getProfile(
        @AuthenticationPrincipal UserPrincipal principal) {
        
        Long userId = principal.getId();
        log.info("Getting profile for user: {}", userId);
        
        UserResponse userResponse = userService.getUserById(userId);
        UserProfileResponse profile = convertToProfileResponse(userResponse);
        
        return Result.success(profile);
    }
    
    @Operation(
        summary = "更新个人信息",
        description = "更新当前登录用户的个人档案信息（不包括敏感信息如用户名、角色等）",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "更新成功",
                content = @Content(schema = @Schema(implementation = UserProfileResponse.class))
            ),
            @ApiResponse(
                responseCode = "400", 
                description = "请求参数错误"
            ),
            @ApiResponse(
                responseCode = "409", 
                description = "邮箱已被其他用户使用"
            )
        }
    )
    @PutMapping
    public Result<UserProfileResponse> updateProfile(
        @AuthenticationPrincipal UserPrincipal principal,
        @Parameter(description = "个人档案更新请求信息", required = true)
        @Valid @RequestBody UserProfileUpdateRequest request) {
        
        Long userId = principal.getId();
        log.info("Updating profile for user: {}", userId);
        
        // 将ProfileUpdateRequest转换为UserUpdateRequest
        UserUpdateRequest userUpdateRequest = new UserUpdateRequest();
        userUpdateRequest.setEmail(request.getEmail());
        userUpdateRequest.setPhone(request.getPhone());
        userUpdateRequest.setRealName(request.getRealName());
        // 注意：不允许用户修改status、departmentId、roleIds
        
        UserResponse userResponse = userService.updateUser(userId, userUpdateRequest);
        UserProfileResponse profile = convertToProfileResponse(userResponse);
        
        return Result.success(profile);
    }
    
    @Operation(
        summary = "修改密码",
        description = "用户修改自己的密码",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "修改成功"
            ),
            @ApiResponse(
                responseCode = "400", 
                description = "旧密码不正确或新密码格式错误"
            )
        }
    )
    @PostMapping("/change-password")
    public Result<Void> changePassword(
        @AuthenticationPrincipal UserPrincipal principal,
        @Parameter(description = "修改密码请求信息", required = true)
        @Valid @RequestBody ChangePasswordRequest request) {
        
        Long userId = principal.getId();
        log.info("Changing password for user: {}", userId);
        
        userService.changePassword(userId, request);
        return Result.success();
    }
    
    @Operation(
        summary = "获取个人权限信息",
        description = "获取当前用户的角色和权限信息",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "获取成功"
            )
        }
    )
    @GetMapping("/permissions")
    public Result<UserPermissionInfo> getPermissions(
        @AuthenticationPrincipal UserPrincipal principal) {
        
        Long userId = principal.getId();
        log.info("Getting permissions for user: {}", userId);
        
        UserResponse userResponse = userService.getUserById(userId);
        
        UserPermissionInfo permissionInfo = new UserPermissionInfo();
        permissionInfo.setRoleCodes(userResponse.getRoleCodes());
        permissionInfo.setPermissionCodes(userResponse.getPermissionCodes());
        
        return Result.success(permissionInfo);
    }
    
    @Operation(
        summary = "检查邮箱可用性",
        description = "检查邮箱是否可以使用（排除当前用户）",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "检查完成"
            )
        }
    )
    @GetMapping("/check-email")
    public Result<Boolean> checkEmailAvailable(
        @AuthenticationPrincipal UserPrincipal principal,
        @Parameter(description = "邮箱地址", required = true, example = "user@example.com")
        @RequestParam String email) {
        
        Long userId = principal.getId();
        
        // 检查邮箱是否被其他用户使用
        boolean exists = userService.existsByEmail(email);
        if (!exists) {
            return Result.success(true); // 邮箱可用
        }
        
        // 如果邮箱存在，检查是否是当前用户的邮箱
        UserResponse currentUser = userService.getUserById(userId);
        boolean isCurrentUserEmail = email.equals(currentUser.getEmail());
        
        return Result.success(isCurrentUserEmail); // 如果是当前用户的邮箱，也算可用
    }
    
    /**
     * 转换UserResponse为UserProfileResponse
     */
    private UserProfileResponse convertToProfileResponse(UserResponse userResponse) {
        UserProfileResponse profile = new UserProfileResponse();
        profile.setId(userResponse.getId());
        profile.setUsername(userResponse.getUsername());
        profile.setEmail(userResponse.getEmail());
        profile.setPhone(userResponse.getPhone());
        profile.setRealName(userResponse.getRealName());
        profile.setLastLoginTime(userResponse.getLastLoginTime());
        profile.setCreatedTime(userResponse.getCreatedTime());
        profile.setDepartmentName(userResponse.getDepartmentName());

        // 转换角色信息为角色名称列表
        if (userResponse.getRoles() != null) {
            profile.setRoleNames(userResponse.getRoles().stream()
                    .map(role -> role.getName())
                    .toList());
        }
        
        return profile;
    }
    
    /**
     * 用户权限信息内部类
     */
    @Schema(description = "用户权限信息")
    public static class UserPermissionInfo {
        @Schema(description = "角色代码列表")
        private java.util.List<String> roleCodes;
        
        @Schema(description = "权限代码列表")
        private java.util.List<String> permissionCodes;
        
        // Getters and Setters
        public java.util.List<String> getRoleCodes() { return roleCodes; }
        public void setRoleCodes(java.util.List<String> roleCodes) { this.roleCodes = roleCodes; }
        public java.util.List<String> getPermissionCodes() { return permissionCodes; }
        public void setPermissionCodes(java.util.List<String> permissionCodes) { this.permissionCodes = permissionCodes; }
    }
}
