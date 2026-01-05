package com.assoc.iam.service;

import com.assoc.iam.entity.User;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class JwtService {
    
    @Value("${jwt.secret:water-platform-jwt-secret-key-12345678901234567890}")
    private String secretKey;
    
    @Value("${jwt.access-token-expiration:7200000}") // 2 hours in milliseconds
    private long accessTokenExpiration;
    
    @Value("${jwt.refresh-token-expiration:604800000}") // 7 days in milliseconds
    private long refreshTokenExpiration;
    
    @Value("${jwt.issuer:water-platform}")
    private String issuer;
    
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secretKey.getBytes());
    }
    
    /**
     * Generate access token for user
     */
    public String generateAccessToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getId());
        claims.put("username", user.getUsername());
        claims.put("email", user.getEmail());
        claims.put("realName", user.getRealName());
        claims.put("roles", user.getRoleCodes());
        claims.put("permissions", user.getPermissionCodes());
        claims.put("tokenType", "access");

        return generateToken(claims, user.getUsername(), accessTokenExpiration);
    }
    
    /**
     * Generate refresh token for user
     */
    public String generateRefreshToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getId());
        claims.put("username", user.getUsername());
        claims.put("tokenType", "refresh");

        return generateToken(claims, user.getUsername(), refreshTokenExpiration);
    }
    
    /**
     * Generate token with claims
     */
    private String generateToken(Map<String, Object> claims, String subject, long expiration) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiration);
        
        return Jwts.builder()
                .claims(claims)
                .subject(subject)
                .issuer(issuer)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getSigningKey())
                .compact();
    }
    
    /**
     * Extract username from token
     */
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }
    
    /**
     * Extract user ID from token
     */
    public Long extractUserId(String token) {
        return extractClaim(token, claims -> claims.get("userId", Long.class));
    }

    /**
     * Extract token type from token
     */
    public String extractTokenType(String token) {
        return extractClaim(token, claims -> claims.get("tokenType", String.class));
    }
    
    /**
     * Extract user roles from token
     */
    @SuppressWarnings("unchecked")
    public List<String> extractRoles(String token) {
        return extractClaim(token, claims -> claims.get("roles", List.class));
    }
    
    /**
     * Extract user permissions from token
     */
    @SuppressWarnings("unchecked")
    public List<String> extractPermissions(String token) {
        return extractClaim(token, claims -> claims.get("permissions", List.class));
    }
    
    /**
     * Extract expiration date from token
     */
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }
    
    /**
     * Extract specific claim from token
     */
    public <T> T extractClaim(String token, ClaimsResolver<T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.resolve(claims);
    }
    
    /**
     * Extract all claims from token
     */
    private Claims extractAllClaims(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (JwtException e) {
            log.error("Failed to parse JWT token: {}", e.getMessage());
            throw e;
        }
    }
    
    /**
     * Check if token is expired
     */
    public boolean isTokenExpired(String token) {
        try {
            return extractExpiration(token).before(new Date());
        } catch (JwtException e) {
            log.error("Error checking token expiration: {}", e.getMessage());
            return true;
        }
    }
    
    /**
     * Validate token against user
     */
    public boolean isTokenValid(String token, User user) {
        try {
            final String username = extractUsername(token);
            return (username.equals(user.getUsername()) && !isTokenExpired(token));
        } catch (JwtException e) {
            log.error("Token validation failed: {}", e.getMessage());
            return false;
        }
    }
    
    /**
     * Validate access token
     */
    public boolean isAccessTokenValid(String token) {
        try {
            String tokenType = extractTokenType(token);
            return "access".equals(tokenType) && !isTokenExpired(token);
        } catch (JwtException e) {
            log.error("Access token validation failed: {}", e.getMessage());
            return false;
        }
    }
    
    /**
     * Validate refresh token
     */
    public boolean isRefreshTokenValid(String token) {
        try {
            String tokenType = extractTokenType(token);
            return "refresh".equals(tokenType) && !isTokenExpired(token);
        } catch (JwtException e) {
            log.error("Refresh token validation failed: {}", e.getMessage());
            return false;
        }
    }
    
    /**
     * Get remaining expiration time in milliseconds
     */
    public long getRemainingExpiration(String token) {
        try {
            Date expiration = extractExpiration(token);
            return Math.max(0, expiration.getTime() - new Date().getTime());
        } catch (JwtException e) {
            log.error("Error getting token expiration: {}", e.getMessage());
            return 0;
        }
    }
    
    @FunctionalInterface
    public interface ClaimsResolver<T> {
        T resolve(Claims claims);
    }
}
