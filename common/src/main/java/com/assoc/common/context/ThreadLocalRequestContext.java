package com.assoc.common.context;

import org.springframework.util.CollectionUtils;

import java.util.Collection;
import java.util.Collections;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;


/**
 * 基于 ThreadLocal 的请求上下文实现，适用于每个线程独立维护上下文的场景。
 */
public class ThreadLocalRequestContext implements RequestContext {

    private static final ThreadLocal<ContextState> STATE = ThreadLocal.withInitial(ContextState::new);

    @Override
    public Optional<Long> currentUserId() {
        return Optional.ofNullable(STATE.get().userId);
    }

    @Override
    public void setCurrentUserId(Long userId) {
        STATE.get().userId = userId;
    }

    @Override
    public Optional<String> currentUsername() {
        return Optional.ofNullable(STATE.get().username);
    }

    @Override
    public void setCurrentUsername(String username) {
        STATE.get().username = username;
    }

    @Override
    public Collection<String> authorities() {
        Set<String> authorities = STATE.get().authorities;
        if (CollectionUtils.isEmpty(authorities)) {
            return Collections.emptySet();
        }
        return Collections.unmodifiableSet(authorities);
    }

    @Override
    public void setAuthorities(Collection<String> authorities) {
        ContextState state = STATE.get();
        state.authorities.clear();
        if (!CollectionUtils.isEmpty(authorities)) {
            state.authorities.addAll(authorities);
        }
    }

    @Override
    public RequestContextSnapshot snapshot() {
        ContextState state = STATE.get();
        return new RequestContextSnapshot(
                state.userId,
                state.username,
                state.authorities
        );
    }

    @Override
    public void restore(RequestContextSnapshot snapshot) {
        if (snapshot == null) {
            clear();
            return;
        }
        ContextState state = STATE.get();
        state.userId = snapshot.getUserId();
        state.username = snapshot.getUsername();
        state.authorities.clear();
        state.authorities.addAll(snapshot.getAuthorities());
    }

    @Override
    public void clear() {
        STATE.remove();
    }

    private static class ContextState {
        private Long userId;
        private String username;
        private final Set<String> authorities = new HashSet<>();
    }
}
