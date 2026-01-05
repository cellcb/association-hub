package com.assoc.iam.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.assoc.common.security.SecurityWhitelist;
import com.assoc.iam.service.DynamicPermissionService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class DynamicPermissionFilter extends OncePerRequestFilter {
    
    private final DynamicPermissionService dynamicPermissionService;
    private final ObjectMapper objectMapper;
    private final SecurityWhitelist securityWhitelist;
    private final AntPathMatcher pathMatcher = new AntPathMatcher();
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, 
                                  FilterChain filterChain) throws ServletException, IOException {
        
        String requestPath = request.getRequestURI();
        String httpMethod = request.getMethod();
        
        log.debug("权限过滤器检查: {} {}", httpMethod, requestPath);
        
        // 检查是否是排除的路径
        if (isExcludedPath(requestPath)) {
            log.debug("路径 {} 在排除列表中，跳过权限检查", requestPath);
            filterChain.doFilter(request, response);
            return;
        }
        
        // 获取当前认证用户
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            log.debug("用户未认证，拒绝访问: {} {}", httpMethod, requestPath);
            sendUnauthorizedResponse(response, "用户未认证");
            return;
        }
        
        // 如果是匿名用户，拒绝访问
        if ("anonymousUser".equals(authentication.getPrincipal())) {
            log.debug("匿名用户访问受保护资源，拒绝访问: {} {}", httpMethod, requestPath);
            sendUnauthorizedResponse(response, "匿名用户无法访问受保护资源");
            return;
        }
        
        try {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            Long userId = userPrincipal.getId();
            
            // 进行动态权限检查
            boolean hasPermission = dynamicPermissionService.hasPermission(userId, requestPath, httpMethod);
            
            if (hasPermission) {
                log.debug("用户 {} 有权限访问 {} {}", userId, httpMethod, requestPath);
                filterChain.doFilter(request, response);
            } else {
                log.warn("用户 {} 没有权限访问 {} {}", userId, httpMethod, requestPath);
                sendForbiddenResponse(response, "访问被拒绝：权限不足");
            }
            
        } catch (ClassCastException e) {
            log.error("用户主体类型错误", e);
            sendUnauthorizedResponse(response, "用户认证信息错误");
        } catch (Exception e) {
            log.error("权限检查时发生错误: {} {}", httpMethod, requestPath, e);
            sendForbiddenResponse(response, "权限检查失败");
        }
    }
    
    /**
     * 检查路径是否在排除列表中
     */
    private boolean isExcludedPath(String requestPath) {
        return securityWhitelist.getPermissionExemptPatterns().stream()
                .anyMatch(pattern -> pathMatcher.match(pattern, requestPath));
    }
    
    /**
     * 发送401未认证响应
     */
    private void sendUnauthorizedResponse(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json;charset=UTF-8");
        
        Map<String, Object> result = new java.util.HashMap<>();
        result.put("code", 401);
        result.put("message", message);
        result.put("data", null);
        result.put("timestamp", System.currentTimeMillis());
        
        response.getWriter().write(objectMapper.writeValueAsString(result));
    }
    
    /**
     * 发送403禁止访问响应
     */
    private void sendForbiddenResponse(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType("application/json;charset=UTF-8");
        
        Map<String, Object> result = new java.util.HashMap<>();
        result.put("code", 403);
        result.put("message", message);
        result.put("data", null);
        result.put("timestamp", System.currentTimeMillis());
        
        response.getWriter().write(objectMapper.writeValueAsString(result));
    }
    
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        // 可以在这里添加更细粒度的过滤控制
        // 返回true表示跳过此过滤器，false表示执行过滤
        return false;
    }
}
