package com.assoc.ai.util;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;

/**
 * Utility for extracting text content from JSON structures.
 * Recursively extracts all text values and concatenates them.
 */
@Slf4j
public class JsonTextExtractor {

    private static final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Extract all text values from a JSON string.
     *
     * @param json the JSON string
     * @return concatenated text content
     */
    public static String extractText(String json) {
        if (json == null || json.isBlank()) {
            return "";
        }

        // If it doesn't look like JSON, return as-is
        String trimmed = json.trim();
        if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) {
            return json;
        }

        try {
            JsonNode node = objectMapper.readTree(json);
            StringBuilder sb = new StringBuilder();
            extractTextRecursive(node, sb);
            return sb.toString().trim();
        } catch (Exception e) {
            // Not valid JSON, return original text
            log.debug("Input is not valid JSON, returning as-is: {}", e.getMessage());
            return json;
        }
    }

    /**
     * Recursively extract text from JSON nodes.
     */
    private static void extractTextRecursive(JsonNode node, StringBuilder sb) {
        if (node == null) {
            return;
        }

        if (node.isTextual()) {
            String text = node.asText();
            if (!text.isBlank()) {
                sb.append(text).append(" ");
            }
        } else if (node.isNumber()) {
            sb.append(node.asText()).append(" ");
        } else if (node.isArray()) {
            for (JsonNode element : node) {
                extractTextRecursive(element, sb);
            }
        } else if (node.isObject()) {
            node.fields().forEachRemaining(entry -> {
                // Skip certain technical field names
                String fieldName = entry.getKey();
                if (!isSkippableField(fieldName)) {
                    extractTextRecursive(entry.getValue(), sb);
                }
            });
        }
    }

    /**
     * Check if a field should be skipped during extraction.
     */
    private static boolean isSkippableField(String fieldName) {
        // Skip technical fields that don't contain meaningful text
        return fieldName.equalsIgnoreCase("id") ||
               fieldName.equalsIgnoreCase("_id") ||
               fieldName.equalsIgnoreCase("uuid") ||
               fieldName.equalsIgnoreCase("createdAt") ||
               fieldName.equalsIgnoreCase("updatedAt") ||
               fieldName.equalsIgnoreCase("timestamp");
    }
}
