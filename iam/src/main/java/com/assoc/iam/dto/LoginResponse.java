package com.assoc.iam.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "登录响应")
public class LoginResponse {
    
    @Schema(description = "访问令牌", example = "eyJhbGciOiJIUzI1NiJ9...")
    private String accessToken;
    
    @Schema(description = "刷新令牌", example = "eyJhbGciOiJIUzI1NiJ9...")
    private String refreshToken;
    
    @Schema(description = "令牌过期时间（秒）", example = "7200")
    private Long expiresIn;
    
    @Schema(description = "用户信息")
    private UserInfo user;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "用户信息")
    public static class UserInfo {
        @Schema(description = "用户ID", example = "1")
        private Long id;
        
        @Schema(description = "用户名", example = "admin")
        private String username;
        
        @Schema(description = "邮箱", example = "admin@waterplatform.com")
        private String email;
        
        @Schema(description = "真实姓名", example = "系统管理员")
        private String realName;
        
        @Schema(description = "角色列表", example = "[\"SUPER_ADMIN\"]")
        private List<String> roles;
    }
}
