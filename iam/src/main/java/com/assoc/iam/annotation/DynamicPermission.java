package com.assoc.iam.annotation;

import java.lang.annotation.*;

/**
 * 动态权限检查注解
 * 用于标注需要进行动态权限检查的方法
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface DynamicPermission {
    
    /**
     * 资源路径，支持SpEL表达式
     * 例如: "/api/iam/users/{id}", "/api/iam/departments/*"
     * 如果不指定，将自动从请求中获取
     */
    String resource() default "";
    
    /**
     * HTTP方法，如果不指定，将自动从请求中获取
     */
    String method() default "";
    
    /**
     * 权限代码，如果指定则直接检查该权限
     * 优先级高于resource+method的组合检查
     */
    String permission() default "";
    
    /**
     * 是否启用动态权限检查
     */
    boolean enabled() default true;
    
    /**
     * 权限检查失败时的错误消息
     */
    String message() default "访问被拒绝：权限不足";
}
