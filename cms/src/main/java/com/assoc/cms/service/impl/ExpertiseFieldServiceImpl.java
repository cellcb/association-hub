package com.assoc.cms.service.impl;

import com.assoc.cms.dto.ExpertiseFieldResponse;
import com.assoc.cms.entity.ExpertiseField;
import com.assoc.cms.repository.ExpertiseFieldRepository;
import com.assoc.cms.service.ExpertiseFieldService;
import com.assoc.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ExpertiseFieldServiceImpl implements ExpertiseFieldService {

    private final ExpertiseFieldRepository expertiseFieldRepository;

    @Override
    public List<ExpertiseFieldResponse> getAllFields() {
        return expertiseFieldRepository.findAllByOrderBySortOrderAsc().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ExpertiseFieldResponse> getActiveFields() {
        return expertiseFieldRepository.findByStatusOrderBySortOrderAsc(1).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ExpertiseFieldResponse getById(Long id) {
        ExpertiseField field = expertiseFieldRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("专业领域不存在: " + id));
        return toResponse(field);
    }

    private ExpertiseFieldResponse toResponse(ExpertiseField field) {
        ExpertiseFieldResponse response = new ExpertiseFieldResponse();
        response.setId(field.getId());
        response.setName(field.getName());
        response.setCode(field.getCode());
        response.setSortOrder(field.getSortOrder());
        response.setStatus(field.getStatus());
        return response;
    }
}
