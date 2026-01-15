package com.assoc.cms.service.impl;

import com.assoc.cms.dto.ExpertiseFieldRequest;
import com.assoc.cms.dto.ExpertiseFieldResponse;
import com.assoc.cms.entity.ExpertiseField;
import com.assoc.cms.repository.ExpertRepository;
import com.assoc.cms.repository.ExpertiseFieldRepository;
import com.assoc.cms.service.ExpertiseFieldService;
import com.assoc.common.exception.BusinessException;
import com.assoc.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ExpertiseFieldServiceImpl implements ExpertiseFieldService {

    private final ExpertiseFieldRepository expertiseFieldRepository;
    private final ExpertRepository expertRepository;

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

    @Override
    @Transactional
    public ExpertiseFieldResponse create(ExpertiseFieldRequest request) {
        String code = request.getCode();
        if (!StringUtils.hasText(code)) {
            code = "FIELD_" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        }

        if (expertiseFieldRepository.existsByCode(code)) {
            throw new BusinessException("领域代码已存在: " + code);
        }

        ExpertiseField field = new ExpertiseField();
        field.setName(request.getName());
        field.setCode(code);
        field.setSortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0);
        field.setStatus(request.getStatus() != null ? request.getStatus() : 1);
        field.setDescription(request.getDescription());

        field = expertiseFieldRepository.save(field);
        return toResponse(field);
    }

    @Override
    @Transactional
    public ExpertiseFieldResponse update(Long id, ExpertiseFieldRequest request) {
        ExpertiseField field = expertiseFieldRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("专业领域不存在: " + id));

        if (StringUtils.hasText(request.getCode()) && !request.getCode().equals(field.getCode())) {
            if (expertiseFieldRepository.existsByCodeAndIdNot(request.getCode(), id)) {
                throw new BusinessException("领域代码已存在: " + request.getCode());
            }
            field.setCode(request.getCode());
        }

        field.setName(request.getName());
        if (request.getSortOrder() != null) {
            field.setSortOrder(request.getSortOrder());
        }
        if (request.getStatus() != null) {
            field.setStatus(request.getStatus());
        }
        field.setDescription(request.getDescription());

        field = expertiseFieldRepository.save(field);
        return toResponse(field);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        ExpertiseField field = expertiseFieldRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("专业领域不存在: " + id));

        long expertCount = expertRepository.countByExpertiseFieldId(id);
        if (expertCount > 0) {
            throw new BusinessException("该领域下存在 " + expertCount + " 位专家，请先移除相关专家的领域关联");
        }

        expertiseFieldRepository.delete(field);
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
