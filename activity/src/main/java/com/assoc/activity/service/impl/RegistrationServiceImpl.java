package com.assoc.activity.service.impl;

import com.assoc.activity.dto.RegistrationRequest;
import com.assoc.activity.dto.RegistrationResponse;
import com.assoc.activity.entity.Activity;
import com.assoc.activity.entity.ActivityRegistration;
import com.assoc.activity.entity.ActivityStatus;
import com.assoc.activity.entity.RegistrationStatus;
import com.assoc.activity.repository.ActivityRegistrationRepository;
import com.assoc.activity.repository.ActivityRepository;
import com.assoc.activity.service.RegistrationService;
import com.assoc.common.exception.BusinessException;
import com.assoc.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RegistrationServiceImpl implements RegistrationService {

    private final ActivityRepository activityRepository;
    private final ActivityRegistrationRepository registrationRepository;

    @Override
    @Transactional
    public RegistrationResponse register(Long activityId, RegistrationRequest request, Long userId) {
        Activity activity = activityRepository.findById(activityId)
                .orElseThrow(() -> new ResourceNotFoundException("活动不存在: " + activityId));

        // Check activity status
        if (activity.getStatus() != ActivityStatus.UPCOMING) {
            throw new BusinessException("该活动已不接受报名");
        }

        // Check capacity
        if (activity.getCapacity() != null && activity.getRegisteredCount() >= activity.getCapacity()) {
            throw new BusinessException("活动报名人数已满");
        }

        // Check duplicate registration
        if (registrationRepository.existsByActivityIdAndPhone(activityId, request.getPhone())) {
            throw new BusinessException("该手机号已报名此活动");
        }

        ActivityRegistration registration = new ActivityRegistration();
        registration.setActivityId(activityId);
        registration.setUserId(userId);
        registration.setName(request.getName());
        registration.setPhone(request.getPhone());
        registration.setEmail(request.getEmail());
        registration.setCompany(request.getCompany());
        registration.setPosition(request.getPosition());
        registration.setMemberType(request.getMemberType());
        registration.setMemberId(request.getMemberId());
        registration.setIsMemberRegistration(request.getMemberId() != null);
        registration.setSpecialRequirements(request.getSpecialRequirements());
        registration.setStatus(RegistrationStatus.PENDING);

        registration = registrationRepository.save(registration);
        activityRepository.incrementRegisteredCount(activityId);

        return toResponse(registration, activity.getTitle());
    }

    @Override
    public RegistrationResponse getRegistrationById(Long id) {
        ActivityRegistration registration = registrationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("报名记录不存在: " + id));
        Activity activity = activityRepository.findById(registration.getActivityId())
                .orElse(null);
        return toResponse(registration, activity != null ? activity.getTitle() : null);
    }

    @Override
    public RegistrationResponse getRegistrationByActivityAndPhone(Long activityId, String phone) {
        ActivityRegistration registration = registrationRepository.findByActivityIdAndPhone(activityId, phone)
                .orElseThrow(() -> new ResourceNotFoundException("报名记录不存在"));
        Activity activity = activityRepository.findById(activityId)
                .orElse(null);
        return toResponse(registration, activity != null ? activity.getTitle() : null);
    }

    @Override
    public boolean isRegistered(Long activityId, String phone) {
        return registrationRepository.existsByActivityIdAndPhone(activityId, phone);
    }

    @Override
    public Page<RegistrationResponse> getRegistrations(Long activityId, RegistrationStatus status, Pageable pageable) {
        Activity activity = activityRepository.findById(activityId)
                .orElseThrow(() -> new ResourceNotFoundException("活动不存在: " + activityId));

        Page<ActivityRegistration> registrations;
        if (status != null) {
            registrations = registrationRepository.findByActivityIdAndStatus(activityId, status, pageable);
        } else {
            registrations = registrationRepository.findByActivityId(activityId, pageable);
        }
        return registrations.map(r -> toResponse(r, activity.getTitle()));
    }

    @Override
    @Transactional
    public void updateStatus(Long id, RegistrationStatus status) {
        ActivityRegistration registration = registrationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("报名记录不存在: " + id));
        registration.setStatus(status);
        registrationRepository.save(registration);
    }

    @Override
    @Transactional
    public void cancelRegistration(Long id) {
        ActivityRegistration registration = registrationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("报名记录不存在: " + id));

        if (registration.getStatus() == RegistrationStatus.CANCELLED) {
            return;
        }

        registration.setStatus(RegistrationStatus.CANCELLED);
        registrationRepository.save(registration);
        activityRepository.decrementRegisteredCount(registration.getActivityId());
    }

    private RegistrationResponse toResponse(ActivityRegistration registration, String activityTitle) {
        RegistrationResponse response = new RegistrationResponse();
        response.setId(registration.getId());
        response.setActivityId(registration.getActivityId());
        response.setActivityTitle(activityTitle);
        response.setUserId(registration.getUserId());
        response.setName(registration.getName());
        response.setPhone(registration.getPhone());
        response.setEmail(registration.getEmail());
        response.setCompany(registration.getCompany());
        response.setPosition(registration.getPosition());
        response.setMemberType(registration.getMemberType());
        response.setMemberId(registration.getMemberId());
        response.setIsMemberRegistration(registration.getIsMemberRegistration());
        response.setSpecialRequirements(registration.getSpecialRequirements());
        response.setStatus(registration.getStatus());
        response.setStatusName(getStatusName(registration.getStatus()));
        response.setCreatedTime(registration.getCreatedTime());
        return response;
    }

    private String getStatusName(RegistrationStatus status) {
        if (status == null) return null;
        return switch (status) {
            case PENDING -> "待确认";
            case CONFIRMED -> "已确认";
            case CANCELLED -> "已取消";
            case ATTENDED -> "已参加";
        };
    }
}
