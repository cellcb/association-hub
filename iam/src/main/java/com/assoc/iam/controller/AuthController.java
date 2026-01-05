package com.assoc.iam.controller;

import com.assoc.common.Result;
import com.assoc.common.audit.Audit;
import com.assoc.common.audit.AuditAction;
import com.assoc.iam.dto.LoginRequest;
import com.assoc.iam.dto.LoginResponse;
import com.assoc.iam.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/iam/auth")
@RequiredArgsConstructor
@Tag(name = "身份认证", description = "用户登录、Token管理相关接口（原路径：/api/auth）")
public class AuthController {
    
    private static final String AUTHORIZATION_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";

    private final AuthService authService;
    
    /**
     * User login
     */
    @Operation(
        summary = "用户登录",
        description = "通过用户名和密码进行身份认证，成功后返回访问令牌和刷新令牌",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "登录成功",
                content = @Content(schema = @Schema(implementation = LoginResponse.class))
            ),
            @ApiResponse(
                responseCode = "401", 
                description = "用户名或密码错误"
            )
        }
    )
    @PostMapping("/login")
    @Audit(action = AuditAction.LOGIN, resource = "auth")
    public Result<LoginResponse> login(
        @Parameter(description = "登录请求信息", required = true)
        @Valid @RequestBody LoginRequest loginRequest) {
        try {
            LoginResponse response = authService.login(loginRequest);
            return Result.success("登录成功", response);
        } catch (Exception e) {
            log.error("Login failed for user: {}, error: {}", loginRequest.getUsername(), e.getMessage());
            return Result.error(401, e.getMessage());
        }
    }
    
    /**
     * Refresh access token
     */
    @Operation(
        summary = "刷新访问令牌",
        description = "使用刷新令牌获取新的访问令牌和刷新令牌",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Token刷新成功",
                content = @Content(schema = @Schema(implementation = LoginResponse.class))
            ),
            @ApiResponse(
                responseCode = "401", 
                description = "刷新令牌无效或已过期"
            )
        }
    )
    @PostMapping("/refresh")
    @Audit(action = AuditAction.ACCESS, resource = "auth")
    public Result<LoginResponse> refreshToken(
        @Parameter(description = "刷新令牌请求", required = true)
        @RequestBody RefreshTokenRequest request) {
        try {
            if (!StringUtils.hasText(request.getRefreshToken())) {
                return Result.error(400, "Refresh token 不能为空");
            }
            
            LoginResponse response = authService.refreshToken(request.getRefreshToken());
            return Result.success("Token 刷新成功", response);
        } catch (Exception e) {
            log.error("Token refresh failed: {}", e.getMessage());
            return Result.error(401, e.getMessage());
        }
    }
    
    /**
     * Validate token
     */
    @Operation(
        summary = "验证访问令牌",
        description = "验证请求头中的访问令牌是否有效",
        security = @SecurityRequirement(name = "Bearer Authentication"),
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "验证完成",
                content = @Content(schema = @Schema(implementation = Boolean.class))
            ),
            @ApiResponse(
                responseCode = "401", 
                description = "令牌无效或已过期"
            )
        }
    )
    @GetMapping("/validate")
    public Result<Boolean> validateToken(
        @Parameter(hidden = true) HttpServletRequest request) {
        try {
            String token = extractTokenFromRequest(request);
            if (token == null) {
                return Result.error(400, "Token 不能为空");
            }
            
            boolean isValid = authService.validateToken(token);
            return Result.success("Token 验证完成", isValid);
        } catch (Exception e) {
            log.error("Token validation failed: {}", e.getMessage());
            return Result.error(401, e.getMessage());
        }
    }
    
    /**
     * Get current user info
     */
    @Operation(
        summary = "获取当前用户信息",
        description = "根据访问令牌获取当前登录用户的详细信息",
        security = @SecurityRequirement(name = "Bearer Authentication"),
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "获取成功",
                content = @Content(schema = @Schema(implementation = LoginResponse.UserInfo.class))
            ),
            @ApiResponse(
                responseCode = "401", 
                description = "令牌无效或已过期"
            )
        }
    )
    @GetMapping("/userinfo")
    public Result<LoginResponse.UserInfo> getUserInfo(
        @Parameter(hidden = true) HttpServletRequest request) {
        try {
            String token = extractTokenFromRequest(request);
            if (token == null) {
                return Result.error(400, "Token 不能为空");
            }
            
            LoginResponse.UserInfo userInfo = authService.getUserInfo(token);
            return Result.success("获取用户信息成功", userInfo);
        } catch (Exception e) {
            log.error("Get user info failed: {}", e.getMessage());
            return Result.error(401, e.getMessage());
        }
    }
    
    /**
     * User logout (client-side operation)
     */
    @Operation(
        summary = "用户登出",
        description = "用户登出操作（客户端删除令牌即可，无需服务器端操作）",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "登出成功"
            )
        }
    )
    @PostMapping("/logout")
    @Audit(action = AuditAction.LOGOUT, resource = "auth")
    public Result<Void> logout() {
        // For stateless JWT, logout is handled on the client side by removing the token
        // In a production environment, you might want to maintain a blacklist of tokens
        return Result.success();
    }
    
    /**
     * Extract JWT token from request
     */
    private String extractTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader(AUTHORIZATION_HEADER);
        
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith(BEARER_PREFIX)) {
            return bearerToken.substring(BEARER_PREFIX.length());
        }
        
        return null;
    }
    
    /**
     * Refresh token request DTO
     */
    @Schema(description = "刷新令牌请求")
    public static class RefreshTokenRequest {
        @Schema(description = "刷新令牌", required = true, example = "eyJhbGciOiJIUzI1NiJ9...")
        private String refreshToken;
        
        public String getRefreshToken() {
            return refreshToken;
        }
        
        public void setRefreshToken(String refreshToken) {
            this.refreshToken = refreshToken;
        }
    }
}
