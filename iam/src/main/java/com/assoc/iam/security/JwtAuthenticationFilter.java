package com.assoc.iam.security;

import com.assoc.common.context.RequestContext;
import com.assoc.iam.entity.User;
import com.assoc.iam.repository.UserRepository;
import com.assoc.iam.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    private static final String AUTHORIZATION_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";
    
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final RequestContext requestContext;
    
    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        
        try {
            String token = extractTokenFromRequest(request);
            log.debug("Extracted token from request: {}", token != null ? "present" : "absent");

            if (token != null && jwtService.isAccessTokenValid(token)) {
                log.debug("Token is valid, proceeding with authentication");
                String username = jwtService.extractUsername(token);
                Long userId = jwtService.extractUserId(token);
                List<String> permissions = jwtService.extractPermissions(token);
                log.debug("Token details - username: {}, userId: {}, permissions: {}", username, userId, permissions);

                if (userId != null) {
                    requestContext.setCurrentUserId(userId);
                } else {
                    requestContext.setCurrentUserId(null);
                }

                if (StringUtils.hasText(username)) {
                    requestContext.setCurrentUsername(username);
                } else {
                    requestContext.setCurrentUsername(null);
                }

                if (permissions != null) {
                    requestContext.setAuthorities(permissions);
                } else {
                    requestContext.setAuthorities(List.of());
                }

                if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    // Try to get user from database to create UserPrincipal with roles and permissions
                    Optional<User> userOpt = userRepository.findActiveUserWithRolesAndPermissions(username);

                    if (userOpt.isPresent()) {
                        User user = userOpt.get();
                        UserPrincipal userPrincipal = UserPrincipal.create(user);

                        // Create authentication token with UserPrincipal
                        UsernamePasswordAuthenticationToken authToken =
                                new UsernamePasswordAuthenticationToken(userPrincipal, null, userPrincipal.getAuthorities());

                        // Set additional details
                        JwtAuthenticationDetails details = new JwtAuthenticationDetails(request, userId);
                        authToken.setDetails(details);

                        SecurityContextHolder.getContext().setAuthentication(authToken);

                        log.debug("Successfully authenticated user: {} with permissions: {}", username, permissions);
                    } else {
                        log.warn("User not found in database: {}", username);
                    }
                } else {
                    log.debug("Username is null or authentication already set - username: {}, auth: {}",
                        username, SecurityContextHolder.getContext().getAuthentication() != null ? "present" : "absent");
                }
            } else {
                if (token == null) {
                    log.debug("No token found in request");
                } else {
                    log.debug("Token validation failed");
                }
            }
        } catch (Exception e) {
            log.error("Cannot set user authentication: {}", e.getMessage());
            SecurityContextHolder.clearContext();
            requestContext.clear(); // 清理安全上下文
        }

        filterChain.doFilter(request, response);
    }
    
    /**
     * Extract JWT token from request
     */
    private String extractTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader(AUTHORIZATION_HEADER);
        
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith(BEARER_PREFIX)) {
            return bearerToken.substring(BEARER_PREFIX.length());
        }
        
        return null;
    }
}
