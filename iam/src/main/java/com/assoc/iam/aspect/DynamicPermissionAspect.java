package com.assoc.iam.aspect;

import com.assoc.iam.annotation.DynamicPermission;
import com.assoc.iam.security.UserPrincipal;
import com.assoc.iam.service.DynamicPermissionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.expression.EvaluationContext;
import org.springframework.expression.ExpressionParser;
import org.springframework.expression.spel.standard.SpelExpressionParser;
import org.springframework.expression.spel.support.StandardEvaluationContext;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;
import java.lang.reflect.Method;

@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class DynamicPermissionAspect {
    
    private final DynamicPermissionService dynamicPermissionService;
    private final ExpressionParser expressionParser = new SpelExpressionParser();
    
    @Around("@annotation(com.assoc.iam.annotation.DynamicPermission)")
    public Object checkPermission(ProceedingJoinPoint joinPoint) throws Throwable {
        
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();
        DynamicPermission annotation = method.getAnnotation(DynamicPermission.class);
        
        // 如果注解被禁用，直接执行方法
        if (!annotation.enabled()) {
            return joinPoint.proceed();
        }
        
        // 获取当前用户
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AccessDeniedException("用户未认证");
        }
        
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        Long userId = userPrincipal.getId();
        
        boolean hasPermission = false;
        
        try {
            // 如果指定了具体权限代码，直接检查
            if (StringUtils.hasText(annotation.permission())) {
                String permissionCode = resolveExpression(annotation.permission(), joinPoint);
                hasPermission = dynamicPermissionService.getUserPermissions(userId)
                        .contains(permissionCode);
                
                log.debug("检查用户 {} 是否有权限 {}: {}", userId, permissionCode, hasPermission);
            } 
            // 否则基于资源路径和HTTP方法检查
            else {
                String resource = getResource(annotation, joinPoint);
                String httpMethod = getHttpMethod(annotation);
                
                hasPermission = dynamicPermissionService.hasPermission(userId, resource, httpMethod);
                
                log.debug("检查用户 {} 是否有权限访问 {} {}: {}", userId, httpMethod, resource, hasPermission);
            }
            
            if (!hasPermission) {
                String message = StringUtils.hasText(annotation.message()) ? 
                        annotation.message() : "访问被拒绝：权限不足";
                throw new AccessDeniedException(message);
            }
            
            return joinPoint.proceed();
            
        } catch (AccessDeniedException e) {
            throw e;
        } catch (Exception e) {
            log.error("权限检查时发生错误", e);
            throw new AccessDeniedException("权限检查失败");
        }
    }
    
    /**
     * 获取资源路径
     */
    private String getResource(DynamicPermission annotation, ProceedingJoinPoint joinPoint) {
        if (StringUtils.hasText(annotation.resource())) {
            return resolveExpression(annotation.resource(), joinPoint);
        }
        
        // 从HTTP请求中获取
        HttpServletRequest request = getCurrentRequest();
        if (request != null) {
            return request.getRequestURI();
        }
        
        throw new IllegalStateException("无法获取资源路径");
    }
    
    /**
     * 获取HTTP方法
     */
    private String getHttpMethod(DynamicPermission annotation) {
        if (StringUtils.hasText(annotation.method())) {
            return annotation.method().toUpperCase();
        }
        
        // 从HTTP请求中获取
        HttpServletRequest request = getCurrentRequest();
        if (request != null) {
            return request.getMethod().toUpperCase();
        }
        
        return "GET"; // 默认值
    }
    
    /**
     * 解析SpEL表达式
     */
    private String resolveExpression(String expression, ProceedingJoinPoint joinPoint) {
        if (!expression.contains("#{") && !expression.contains("{")) {
            return expression;
        }
        
        try {
            EvaluationContext context = new StandardEvaluationContext();
            
            // 添加方法参数到上下文
            MethodSignature signature = (MethodSignature) joinPoint.getSignature();
            String[] paramNames = signature.getParameterNames();
            Object[] args = joinPoint.getArgs();
            
            for (int i = 0; i < paramNames.length; i++) {
                context.setVariable(paramNames[i], args[i]);
            }
            
            // 添加请求信息到上下文
            HttpServletRequest request = getCurrentRequest();
            if (request != null) {
                context.setVariable("request", request);
                // 支持路径变量替换，如 /api/iam/users/{id}
                String uri = request.getRequestURI();
                if (expression.contains("{") && args.length > 0) {
                    // 简单的路径变量替换，假设第一个参数是ID
                    expression = expression.replace("{id}", String.valueOf(args[0]));
                }
            }
            
            return expressionParser.parseExpression(expression).getValue(context, String.class);
            
        } catch (Exception e) {
            log.warn("解析表达式失败: {}, 使用原始值", expression, e);
            return expression;
        }
    }
    
    /**
     * 获取当前HTTP请求
     */
    private HttpServletRequest getCurrentRequest() {
        ServletRequestAttributes attributes = 
                (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        return attributes != null ? attributes.getRequest() : null;
    }
}
