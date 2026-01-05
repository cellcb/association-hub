package com.assoc.common.context;

import java.util.Collection;
import java.util.Collections;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

/**
 * 不可变的请求上下文快照，用于跨线程传递用户和权限信息。
 */
public final class RequestContextSnapshot {

    private final Long userId;
    private final String username;
    private final Set<String> authorities;

    public RequestContextSnapshot(Long userId,
                                   String username,
                                   Collection<String> authorities) {
        this.userId = userId;
        this.username = username;
        if (authorities == null || authorities.isEmpty()) {
            this.authorities = Collections.emptySet();
        } else {
            this.authorities = Collections.unmodifiableSet(new HashSet<>(authorities));
        }
    }

    public Long getUserId() {
        return userId;
    }

    public String getUsername() {
        return username;
    }

    public Set<String> getAuthorities() {
        return authorities;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        RequestContextSnapshot that = (RequestContextSnapshot) o;
        return Objects.equals(userId, that.userId) &&
                Objects.equals(username, that.username) &&
                Objects.equals(authorities, that.authorities);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userId, username, authorities);
    }

    @Override
    public String toString() {
        return "RequestContextSnapshot{" +
                "userId=" + userId +
                ", username='" + username + '\'' +
                ", authorities=" + authorities +
                '}';
    }
}
