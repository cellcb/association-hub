package com.assoc.system.service.impl;

import com.assoc.common.exception.BusinessException;
import com.assoc.common.exception.ResourceNotFoundException;
import com.assoc.system.dto.ConfigRequest;
import com.assoc.system.dto.ConfigResponse;
import com.assoc.system.dto.ConfigUpdateRequest;
import com.assoc.system.entity.Config;
import com.assoc.system.repository.ConfigRepository;
import com.assoc.system.service.ConfigService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ConfigServiceImpl implements ConfigService {

    private final ConfigRepository configRepository;
    private final ObjectMapper objectMapper;

    @Override
    public ConfigResponse getById(Long id) {
        Config config = configRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Config", id));
        return toResponse(config);
    }

    @Override
    public ConfigResponse getByKey(String configKey) {
        Config config = configRepository.findByConfigKey(configKey)
                .orElseThrow(() -> new ResourceNotFoundException("配置项不存在: " + configKey));
        return toResponse(config);
    }

    @Override
    public Page<ConfigResponse> getAll(Pageable pageable) {
        return configRepository.findAll(pageable).map(this::toResponse);
    }

    @Override
    public Page<ConfigResponse> getByCategory(String category, Pageable pageable) {
        return configRepository.findByCategory(category, pageable).map(this::toResponse);
    }

    @Override
    public List<ConfigResponse> getAllByCategory(String category) {
        return configRepository.findByCategoryOrderBySortOrderAsc(category)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ConfigResponse> getAllActiveByCategory(String category) {
        return configRepository.findByCategoryAndStatusOrderBySortOrderAsc(category, 1)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public Map<String, String> getAllActiveAsMap() {
        List<Config> configs = configRepository.findByStatusOrderByCategoryAscSortOrderAsc(1);
        Map<String, String> result = new LinkedHashMap<>();
        for (Config config : configs) {
            result.put(config.getConfigKey(), config.getConfigValue());
        }
        return result;
    }

    @Override
    public Map<String, Object> getSiteConfig() {
        List<Config> configs = configRepository.findByStatusOrderByCategoryAscSortOrderAsc(1);
        Map<String, Object> result = new HashMap<>();

        for (Config config : configs) {
            String value = config.getConfigValue();
            Object parsedValue = value;

            // Try to parse all JSON values (arrays, objects, and strings)
            if (value != null && !value.isEmpty()) {
                try {
                    parsedValue = objectMapper.readValue(value, Object.class);
                } catch (JsonProcessingException e) {
                    // Keep as raw string if parsing fails
                    parsedValue = value;
                }
            }

            result.put(config.getConfigKey(), parsedValue);
        }

        return result;
    }

    @Override
    @Transactional
    public ConfigResponse create(ConfigRequest request) {
        if (configRepository.existsByConfigKey(request.getConfigKey())) {
            throw new BusinessException("配置键已存在: " + request.getConfigKey());
        }

        Config config = new Config();
        config.setConfigKey(request.getConfigKey());
        config.setConfigValue(request.getConfigValue());
        config.setCategory(request.getCategory());
        config.setDescription(request.getDescription());
        config.setSortOrder(request.getSortOrder());
        config.setStatus(request.getStatus());

        config = configRepository.save(config);
        return toResponse(config);
    }

    @Override
    @Transactional
    public ConfigResponse update(Long id, ConfigUpdateRequest request) {
        Config config = configRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Config", id));

        if (request.getConfigValue() != null) {
            config.setConfigValue(request.getConfigValue());
        }
        if (request.getDescription() != null) {
            config.setDescription(request.getDescription());
        }
        if (request.getSortOrder() != null) {
            config.setSortOrder(request.getSortOrder());
        }
        if (request.getStatus() != null) {
            config.setStatus(request.getStatus());
        }

        config = configRepository.save(config);
        return toResponse(config);
    }

    @Override
    @Transactional
    public void updateValue(Long id, String value) {
        Config config = configRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Config", id));
        config.setConfigValue(value);
        configRepository.save(config);
    }

    @Override
    @Transactional
    public void batchUpdate(List<ConfigUpdateRequest> requests) {
        // This method should be implemented based on specific needs
        // For now, it's a placeholder
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!configRepository.existsById(id)) {
            throw new ResourceNotFoundException("Config", id);
        }
        configRepository.deleteById(id);
    }

    private ConfigResponse toResponse(Config config) {
        ConfigResponse response = new ConfigResponse();
        response.setId(config.getId());
        response.setConfigKey(config.getConfigKey());
        response.setConfigValue(config.getConfigValue());
        response.setCategory(config.getCategory());
        response.setDescription(config.getDescription());
        response.setSortOrder(config.getSortOrder());
        response.setStatus(config.getStatus());
        response.setCreatedTime(config.getCreatedTime());
        response.setUpdatedTime(config.getUpdatedTime());
        return response;
    }
}
