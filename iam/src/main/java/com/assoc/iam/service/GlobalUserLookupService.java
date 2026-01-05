package com.assoc.iam.service;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.Optional;

/**
 * Provides user lookup utilities for pre-authentication checks.
 */
@Service
@RequiredArgsConstructor
public class GlobalUserLookupService {

    private final JdbcTemplate jdbcTemplate;

    public Optional<UserSnapshot> findByUsername(String username) {
        String normalized = normalize(username);
        if (normalized == null) {
            return Optional.empty();
        }

        return jdbcTemplate.query(
                "SELECT id, status FROM iam_user WHERE username = ?",
                rs -> {
                    if (rs.next()) {
                        return Optional.of(new UserSnapshot(
                                rs.getLong("id"),
                                rs.getInt("status")));
                    }
                    return Optional.empty();
                },
                normalized
        );
    }

    public boolean existsByUsername(String username) {
        String normalized = normalize(username);
        if (normalized == null) {
            return false;
        }

        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(1) FROM iam_user WHERE username = ?",
                Integer.class,
                normalized
        );
        return count != null && count > 0;
    }

    private String normalize(String username) {
        if (!StringUtils.hasText(username)) {
            return null;
        }
        return username.trim();
    }

    public record UserSnapshot(Long userId, Integer status) { }
}
