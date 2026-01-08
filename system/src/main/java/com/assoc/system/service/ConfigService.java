package com.assoc.system.service;

import com.assoc.system.dto.ConfigRequest;
import com.assoc.system.dto.ConfigResponse;
import com.assoc.system.dto.ConfigUpdateRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;

public interface ConfigService {

    ConfigResponse getById(Long id);

    ConfigResponse getByKey(String configKey);

    Page<ConfigResponse> getAll(Pageable pageable);

    Page<ConfigResponse> getByCategory(String category, Pageable pageable);

    List<ConfigResponse> getAllByCategory(String category);

    List<ConfigResponse> getAllActiveByCategory(String category);

    Map<String, String> getAllActiveAsMap();

    Map<String, Object> getSiteConfig();

    ConfigResponse create(ConfigRequest request);

    ConfigResponse update(Long id, ConfigUpdateRequest request);

    void updateValue(Long id, String value);

    void batchUpdate(List<ConfigUpdateRequest> requests);

    void delete(Long id);
}
