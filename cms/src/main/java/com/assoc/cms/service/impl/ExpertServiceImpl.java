package com.assoc.cms.service.impl;

import com.assoc.cms.dto.ExpertListResponse;
import com.assoc.cms.dto.ExpertRequest;
import com.assoc.cms.dto.ExpertResponse;
import com.assoc.cms.dto.ExpertiseFieldResponse;
import com.assoc.cms.entity.Expert;
import com.assoc.cms.entity.ExpertiseField;
import com.assoc.cms.repository.ExpertRepository;
import com.assoc.cms.repository.ExpertiseFieldRepository;
import com.assoc.cms.service.ExpertService;
import com.assoc.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ExpertServiceImpl implements ExpertService {

    private final ExpertRepository expertRepository;
    private final ExpertiseFieldRepository expertiseFieldRepository;

    private static final int STATUS_ACTIVE = 1;
    private static final int STATUS_INACTIVE = 0;

    @Override
    public Page<ExpertListResponse> getActiveExperts(Pageable pageable) {
        return expertRepository.findByStatus(STATUS_ACTIVE, pageable)
                .map(this::toListResponse);
    }

    @Override
    public Page<ExpertListResponse> searchExperts(String keyword, Pageable pageable) {
        return expertRepository.searchByKeyword(keyword, STATUS_ACTIVE, pageable)
                .map(this::toListResponse);
    }

    @Override
    public Page<ExpertListResponse> getExpertsByField(Long fieldId, Pageable pageable) {
        return expertRepository.findByExpertiseFieldId(fieldId, pageable)
                .map(this::toListResponse);
    }

    @Override
    public Page<ExpertListResponse> getExpertsByFieldCode(String fieldCode, Pageable pageable) {
        return expertRepository.findByExpertiseFieldCode(fieldCode, pageable)
                .map(this::toListResponse);
    }

    @Override
    public ExpertResponse getExpertById(Long id) {
        Expert expert = expertRepository.findByIdWithExpertise(id)
                .orElseThrow(() -> new ResourceNotFoundException("专家不存在: " + id));
        return toResponse(expert);
    }

    @Override
    public Page<ExpertListResponse> getAllExperts(Integer status, Pageable pageable) {
        if (status != null) {
            return expertRepository.findByStatus(status, pageable)
                    .map(this::toListResponse);
        }
        return expertRepository.findAll(pageable).map(this::toListResponse);
    }

    @Override
    @Transactional
    public ExpertResponse createExpert(ExpertRequest request) {
        Expert expert = new Expert();
        mapRequestToEntity(request, expert);
        expert.setStatus(request.getStatus() != null ? request.getStatus() : STATUS_INACTIVE);

        if (request.getExpertiseFieldIds() != null && !request.getExpertiseFieldIds().isEmpty()) {
            Set<ExpertiseField> fields = new HashSet<>(
                    expertiseFieldRepository.findByIdIn(request.getExpertiseFieldIds()));
            expert.setExpertiseFields(fields);
        }

        expert = expertRepository.save(expert);
        return toResponse(expert);
    }

    @Override
    @Transactional
    public ExpertResponse updateExpert(Long id, ExpertRequest request) {
        Expert expert = expertRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("专家不存在: " + id));

        mapRequestToEntity(request, expert);
        if (request.getStatus() != null) {
            expert.setStatus(request.getStatus());
        }

        if (request.getExpertiseFieldIds() != null) {
            Set<ExpertiseField> fields = new HashSet<>(
                    expertiseFieldRepository.findByIdIn(request.getExpertiseFieldIds()));
            expert.setExpertiseFields(fields);
        }

        expert = expertRepository.save(expert);
        return toResponse(expert);
    }

    @Override
    @Transactional
    public void deleteExpert(Long id) {
        if (!expertRepository.existsById(id)) {
            throw new ResourceNotFoundException("专家不存在: " + id);
        }
        expertRepository.deleteById(id);
    }

    private void mapRequestToEntity(ExpertRequest request, Expert expert) {
        expert.setName(request.getName());
        expert.setTitle(request.getTitle());
        expert.setOrganization(request.getOrganization());
        expert.setLocation(request.getLocation());
        expert.setAchievements(request.getAchievements());
        expert.setEmail(request.getEmail());
        expert.setPhone(request.getPhone());
        expert.setAvatar(request.getAvatar());
        expert.setBio(request.getBio());
        expert.setEducation(request.getEducation());
        expert.setExperience(request.getExperience());
        expert.setProjects(request.getProjects());
        expert.setPublications(request.getPublications());
        expert.setAwards(request.getAwards());
        expert.setResearchAreas(request.getResearchAreas());
    }

    private ExpertListResponse toListResponse(Expert expert) {
        ExpertListResponse response = new ExpertListResponse();
        response.setId(expert.getId());
        response.setName(expert.getName());
        response.setTitle(expert.getTitle());
        response.setOrganization(expert.getOrganization());
        response.setLocation(expert.getLocation());
        response.setAvatar(expert.getAvatar());
        response.setStatus(expert.getStatus());
        response.setAchievements(expert.getAchievements());
        response.setEmail(expert.getEmail());
        response.setPhone(maskPhone(expert.getPhone()));
        if (expert.getExpertiseFields() != null) {
            response.setExpertiseFields(expert.getExpertiseFields().stream()
                    .map(this::toFieldResponse)
                    .collect(Collectors.toList()));
        }
        return response;
    }

    /**
     * 手机号脱敏：138****1234
     */
    private String maskPhone(String phone) {
        if (phone == null || phone.length() < 7) {
            return phone;
        }
        return phone.substring(0, 3) + "****" + phone.substring(phone.length() - 4);
    }

    private ExpertResponse toResponse(Expert expert) {
        ExpertResponse response = new ExpertResponse();
        response.setId(expert.getId());
        response.setName(expert.getName());
        response.setTitle(expert.getTitle());
        response.setOrganization(expert.getOrganization());
        response.setLocation(expert.getLocation());
        response.setAchievements(expert.getAchievements());
        response.setEmail(expert.getEmail());
        response.setPhone(expert.getPhone());
        response.setAvatar(expert.getAvatar());
        response.setBio(expert.getBio());
        response.setStatus(expert.getStatus());
        response.setCreatedTime(expert.getCreatedTime());
        response.setUpdatedTime(expert.getUpdatedTime());
        response.setEducation(expert.getEducation());
        response.setExperience(expert.getExperience());
        response.setProjects(expert.getProjects());
        response.setPublications(expert.getPublications());
        response.setAwards(expert.getAwards());
        response.setResearchAreas(expert.getResearchAreas());
        if (expert.getExpertiseFields() != null) {
            response.setExpertiseFields(expert.getExpertiseFields().stream()
                    .map(this::toFieldResponse)
                    .collect(Collectors.toList()));
        }
        return response;
    }

    private ExpertiseFieldResponse toFieldResponse(ExpertiseField field) {
        ExpertiseFieldResponse response = new ExpertiseFieldResponse();
        response.setId(field.getId());
        response.setName(field.getName());
        response.setCode(field.getCode());
        response.setSortOrder(field.getSortOrder());
        response.setStatus(field.getStatus());
        return response;
    }
}
