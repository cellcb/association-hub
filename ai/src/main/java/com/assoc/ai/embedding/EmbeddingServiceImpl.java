package com.assoc.ai.embedding;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Implementation of EmbeddingService using external embedding API.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class EmbeddingServiceImpl implements EmbeddingService {

    private final RestTemplate restTemplate;

    @Value("${kb.embedding.api.base-url:http://localhost:8081}")
    private String baseUrl;

    @Value("${kb.embedding.api.path:/v1/embeddings}")
    private String apiPath;

    @Value("${kb.embedding.api.model:bge-small-zh-1.5}")
    private String model;

    @Override
    public float[] embed(String text) {
        if (text == null || text.isBlank()) {
            throw new IllegalArgumentException("Text cannot be null or blank");
        }

        List<float[]> results = embedBatch(List.of(text));
        return results.get(0);
    }

    @Override
    @SuppressWarnings("unchecked")
    public List<float[]> embedBatch(List<String> texts) {
        if (texts == null || texts.isEmpty()) {
            return List.of();
        }

        String url = baseUrl + apiPath;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> request = Map.of(
                "model", model,
                "input", texts
        );

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);

        try {
            Map<String, Object> response = restTemplate.postForObject(url, entity, Map.class);

            if (response == null || !response.containsKey("data")) {
                throw new RuntimeException("Invalid response from embedding API");
            }

            List<Map<String, Object>> data = (List<Map<String, Object>>) response.get("data");
            List<float[]> embeddings = new ArrayList<>();

            for (Map<String, Object> item : data) {
                List<Number> embedding = (List<Number>) item.get("embedding");
                float[] vector = new float[embedding.size()];
                for (int i = 0; i < embedding.size(); i++) {
                    vector[i] = embedding.get(i).floatValue();
                }
                embeddings.add(vector);
            }

            log.debug("Generated {} embeddings", embeddings.size());
            return embeddings;

        } catch (Exception e) {
            log.error("Failed to generate embeddings: {}", e.getMessage());
            throw new RuntimeException("Embedding API call failed", e);
        }
    }
}
