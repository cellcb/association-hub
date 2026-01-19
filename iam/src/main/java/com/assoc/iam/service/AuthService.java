package com.assoc.iam.service;

import com.assoc.iam.dto.LoginRequest;
import com.assoc.iam.dto.LoginResponse;
import com.assoc.iam.entity.User;
import com.assoc.iam.exception.AuthenticationException;
import com.assoc.iam.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {
    
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    
    /**
     * User login
     */
    @Transactional
    public LoginResponse login(LoginRequest loginRequest) {
        try {
            // Authenticate user
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsername(),
                            loginRequest.getPassword()
                    )
            );
            
            // Get user with roles and permissions
            User user = userRepository.findActiveUserByUsernameOrEmailWithRolesAndPermissions(loginRequest.getUsername())
                    .orElseThrow(() -> new AuthenticationException("用户不存在或已被禁用"));
            
            // Update last login time
            user.setLastLoginTime(LocalDateTime.now());
            userRepository.save(user);
            
            // Generate tokens
            String accessToken = jwtService.generateAccessToken(user);
            String refreshToken = jwtService.generateRefreshToken(user);
            
            // Build response
            LoginResponse.UserInfo userInfo = LoginResponse.UserInfo.builder()
                    .id(user.getId())
                    .username(user.getUsername())
                    .email(user.getEmail())
                    .realName(user.getRealName())
                    .roles(user.getRoleCodes())
                    .build();
            
            LoginResponse response = LoginResponse.builder()
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .expiresIn(jwtService.getRemainingExpiration(accessToken) / 1000) // Convert to seconds
                    .user(userInfo)
                    .build();
            
            log.info("User logged in successfully: {}", user.getUsername());
            return response;
            
        } catch (BadCredentialsException e) {
            log.warn("Invalid credentials for user: {}", loginRequest.getUsername());
            throw new AuthenticationException("用户名或密码错误");
        } catch (DisabledException e) {
            log.warn("Account disabled for user: {}", loginRequest.getUsername());
            throw new AuthenticationException("账户已被禁用");
        } catch (Exception e) {
            log.error("Login failed for user: {}", loginRequest.getUsername());
            throw new RuntimeException("登录失败", e);
        }
    }
    
    /**
     * Refresh access token
     */
    @Transactional(readOnly = true)
    public LoginResponse refreshToken(String refreshToken) {
        try {
            if (!jwtService.isRefreshTokenValid(refreshToken)) {
                throw new AuthenticationException("Refresh token 无效或已过期");
            }
            
            String username = jwtService.extractUsername(refreshToken);
            User user = userRepository.findActiveUserWithRolesAndPermissions(username)
                    .orElseThrow(() -> new AuthenticationException("用户不存在或已被禁用"));
            
            // Generate new tokens
            String newAccessToken = jwtService.generateAccessToken(user);
            String newRefreshToken = jwtService.generateRefreshToken(user);
            
            // Build response
            LoginResponse.UserInfo userInfo = LoginResponse.UserInfo.builder()
                    .id(user.getId())
                    .username(user.getUsername())
                    .email(user.getEmail())
                    .realName(user.getRealName())
                    .roles(user.getRoleCodes())
                    .build();
            
            LoginResponse response = LoginResponse.builder()
                    .accessToken(newAccessToken)
                    .refreshToken(newRefreshToken)
                    .expiresIn(jwtService.getRemainingExpiration(newAccessToken) / 1000)
                    .user(userInfo)
                    .build();
            
            log.info("Token refreshed successfully for user: {}", username);
            return response;
            
        } catch (AuthenticationException e) {
            throw e;
        } catch (Exception e) {
            log.error("Token refresh failed");
            throw new RuntimeException("Token 刷新失败", e);
        }
    }
    
    /**
     * Validate access token
     */
    public boolean validateToken(String token) {
        try {
            return jwtService.isAccessTokenValid(token);
        } catch (Exception e) {
            log.error("Token validation failed: {}", e.getMessage());
            return false;
        }
    }
    
    /**
     * Get user info from token
     */
    @Transactional(readOnly = true)
    public LoginResponse.UserInfo getUserInfo(String token) {
        try {
            if (!jwtService.isAccessTokenValid(token)) {
                throw new AuthenticationException("Token 无效或已过期");
            }
            
            String username = jwtService.extractUsername(token);
            User user = userRepository.findActiveUserWithRolesAndPermissions(username)
                    .orElseThrow(() -> new AuthenticationException("用户不存在或已被禁用"));
            
            return LoginResponse.UserInfo.builder()
                    .id(user.getId())
                    .username(user.getUsername())
                    .email(user.getEmail())
                    .realName(user.getRealName())
                    .roles(user.getRoleCodes())
                    .build();
            
        } catch (AuthenticationException e) {
            throw e;
        } catch (Exception e) {
            log.error("Get user info failed");
            throw new RuntimeException("获取用户信息失败", e);
        }
    }
}
