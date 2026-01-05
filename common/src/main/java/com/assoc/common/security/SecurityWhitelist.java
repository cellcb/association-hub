package com.assoc.common.security;

import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * 集中维护无需身份验证或权限校验的白名单路径。
 */
@Component
public class SecurityWhitelist {

    private static final List<String> PERMIT_ALL_PATTERNS = List.of(
            "/api/iam/auth/**",
            "/api/public/**",
            "/actuator/health",
            "/api/kb/indexing/**",
            "/docs/**",
            "/swagger-ui/**",
            "/v3/api-docs/**",
            "/error",
            "/favicon.ico"
    );

    private static final List<String> PERMISSION_EXEMPT_PATTERNS =
            Stream.concat(
                    PERMIT_ALL_PATTERNS.stream(),
                    Stream.of(
                            "/actuator/**",
                            "/api/iam/menus/user-menus",
                            "/api/kb/documents/search/external",
                            "/api/kb/documents/search/rag",
                            "/api/kb/documents/search/rag/stream"
                    )
            )
            .distinct()
            .collect(Collectors.toUnmodifiableList());

    private final AntPathMatcher matcher = new AntPathMatcher();

    public List<String> getPermitAllPatterns() {
        return PERMIT_ALL_PATTERNS;
    }

    public List<String> getPermissionExemptPatterns() {
        return PERMISSION_EXEMPT_PATTERNS;
    }

    public boolean isPermitAll(String path) {
        return matchesAny(PERMIT_ALL_PATTERNS, path);
    }

    public boolean isPermissionExempt(String path) {
        return matchesAny(PERMISSION_EXEMPT_PATTERNS, path);
    }

    private boolean matchesAny(List<String> patterns, String path) {
        return patterns.stream().anyMatch(pattern -> matcher.match(pattern, path));
    }
}
