package com.assoc.common.context;

import lombok.extern.slf4j.Slf4j;



/**
 * 兼容层：保留原有静态调用方式，内部委托给 {@link RequestContext}。
 *
 * <p>建议新的代码直接注入 {@link RequestContext} 使用，此类仅作为过渡。</p>
 */
@Slf4j
@Deprecated
public final class SecurityContext {

    private SecurityContext() {
    }

    private static RequestContext delegate() {
        return RequestContextHolder.getRequestContext();
    }

    // ==================== 用户相关方法 ====================

    public static Long getCurrentUserId() {
        return delegate().requireUserId();
    }

    public static Long getCurrentUserIdSafe() {
        return delegate().currentUserId().orElse(null);
    }

    public static String getCurrentUsername() {
        return delegate().currentUsername().orElse(null);
    }

    // ==================== 权限相关方法 ====================

    public static boolean hasAuthority(String authority) {
        return delegate().hasAuthority(authority);
    }

    public static boolean hasAnyAuthority(String... authorities) {
        return delegate().hasAnyAuthority(authorities);
    }

    public static boolean hasAllAuthorities(String... authorities) {
        return delegate().hasAllAuthorities(authorities);
    }


    public static RequestContextSnapshot snapshot() {
        return delegate().snapshot();
    }

    public static void restore(RequestContextSnapshot snapshot) {
        delegate().restore(snapshot);
    }

    // ==================== 清理方法 ====================

    public static void clear() {
        log.debug("Clearing request context");
        delegate().clear();
    }
}
