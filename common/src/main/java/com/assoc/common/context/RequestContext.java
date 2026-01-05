package com.assoc.common.context;

import java.util.Collection;
import java.util.Optional;

/**
 * 平台请求上下文接口，统一管理当前线程中的用户及权限信息。
 */
public interface RequestContext {

    Optional<Long> currentUserId();

    default Long requireUserId() {
        return currentUserId().orElseThrow(() -> new IllegalStateException("无法获取当前用户信息"));
    }

    void setCurrentUserId(Long userId);

    Optional<String> currentUsername();

    void setCurrentUsername(String username);

    Collection<String> authorities();

    void setAuthorities(Collection<String> authorities);

    default boolean hasAuthority(String authority) {
        return authorities().stream().anyMatch(authority::equals);
    }

    default boolean hasAnyAuthority(String... authorities) {
        if (authorities == null || authorities.length == 0) {
            return false;
        }
        for (String authority : authorities) {
            if (hasAuthority(authority)) {
                return true;
            }
        }
        return false;
    }

    default boolean hasAllAuthorities(String... authorities) {
        if (authorities == null || authorities.length == 0) {
            return true;
        }
        for (String authority : authorities) {
            if (!hasAuthority(authority)) {
                return false;
            }
        }
        return true;
    }

    RequestContextSnapshot snapshot();

    void restore(RequestContextSnapshot snapshot);

    void clear();
}
