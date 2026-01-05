package com.assoc.common.audit;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import lombok.extern.slf4j.Slf4j;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Masks sensitive fields in request parameters and serializes them for storage.
 */
@Slf4j
public class ParameterMasker {

    private static final String MASKED_VALUE = "***";
    private static final String TRUNCATION_SUFFIX = "...(truncated)";
    private static final int DEFAULT_MAX_LENGTH = 4000;

    private final Set<String> sensitiveKeys;
    private final ObjectMapper objectMapper;
    private final int maxLength;

    public ParameterMasker(ObjectMapper objectMapper, List<String> sensitiveKeys, int maxLength) {
        this.objectMapper = objectMapper.copy()
                .disable(SerializationFeature.FAIL_ON_EMPTY_BEANS);
        if (CollectionUtils.isEmpty(sensitiveKeys)) {
            this.sensitiveKeys = Set.of();
        } else {
            this.sensitiveKeys = sensitiveKeys.stream()
                    .filter(StringUtils::hasText)
                    .map(key -> key.toLowerCase().trim())
                    .collect(Collectors.toUnmodifiableSet());
        }
        this.maxLength = maxLength > 0 ? maxLength : DEFAULT_MAX_LENGTH;
    }

    /**
     * Apply masking rules and return a JSON string representation (truncated when too large).
     */
    public String maskAndSerialize(Map<String, Object> parameters) {
        if (CollectionUtils.isEmpty(parameters)) {
            return "{}";
        }
        Map<String, Object> sanitized = new LinkedHashMap<>();
        parameters.forEach((key, value) -> sanitized.put(key, maskValue(key, value)));

        try {
            String json = objectMapper.writeValueAsString(sanitized);
            if (json.length() > maxLength) {
                return json.substring(0, maxLength) + TRUNCATION_SUFFIX;
            }
            return json;
        } catch (JsonProcessingException e) {
            log.warn("Failed to serialize audit parameters: {}", e.getMessage());
            return "{\"error\":\"failed_to_serialize\"}";
        }
    }

    private Object maskValue(String key, Object value) {
        if (shouldMask(key)) {
            return MASKED_VALUE;
        }
        if (value == null) {
            return null;
        }
        if (value instanceof Map<?, ?> map) {
            Map<String, Object> nested = new LinkedHashMap<>();
            map.forEach((nestedKey, nestedValue) -> nested.put(
                    nestedKey != null ? nestedKey.toString() : null,
                    maskValue(nestedKey != null ? nestedKey.toString() : null, nestedValue)
            ));
            return nested;
        }
        if (value instanceof Collection<?> collection) {
            List<Object> maskedList = new ArrayList<>(collection.size());
            for (Object element : collection) {
                maskedList.add(maskValue(null, element));
            }
            return maskedList;
        }
        if (value.getClass().isArray()) {
            int length = java.lang.reflect.Array.getLength(value);
            List<Object> maskedList = new ArrayList<>(length);
            for (int i = 0; i < length; i++) {
                maskedList.add(maskValue(null, java.lang.reflect.Array.get(value, i)));
            }
            return maskedList;
        }
        if (value instanceof Enum<?>) {
            return ((Enum<?>) value).name();
        }
        if (isPrimitiveLike(value)) {
            return value;
        }
        try {
            return objectMapper.convertValue(value, Object.class);
        } catch (IllegalArgumentException e) {
            log.debug("Falling back to toString() for {} due to {}", value.getClass().getSimpleName(), e.getMessage());
            return value.toString();
        }
    }

    private boolean shouldMask(String key) {
        return key != null && sensitiveKeys.contains(key.toLowerCase());
    }

    private boolean isPrimitiveLike(Object value) {
        return value instanceof String
                || value instanceof Number
                || value instanceof Boolean
                || value instanceof Character;
    }
}
