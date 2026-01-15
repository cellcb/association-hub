package com.assoc.cms.service;

import com.assoc.cms.dto.ExpertiseFieldRequest;
import com.assoc.cms.dto.ExpertiseFieldResponse;

import java.util.List;

public interface ExpertiseFieldService {

    List<ExpertiseFieldResponse> getAllFields();

    List<ExpertiseFieldResponse> getActiveFields();

    ExpertiseFieldResponse getById(Long id);

    ExpertiseFieldResponse create(ExpertiseFieldRequest request);

    ExpertiseFieldResponse update(Long id, ExpertiseFieldRequest request);

    void delete(Long id);
}
