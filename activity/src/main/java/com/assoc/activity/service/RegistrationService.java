package com.assoc.activity.service;

import com.assoc.activity.dto.RegistrationRequest;
import com.assoc.activity.dto.RegistrationResponse;
import com.assoc.activity.entity.RegistrationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface RegistrationService {

    RegistrationResponse register(Long activityId, RegistrationRequest request, Long userId);

    RegistrationResponse getRegistrationById(Long id);

    RegistrationResponse getRegistrationByActivityAndPhone(Long activityId, String phone);

    boolean isRegistered(Long activityId, String phone);

    // User methods
    Page<RegistrationResponse> getMyRegistrations(Long userId, Pageable pageable);

    // Admin methods
    Page<RegistrationResponse> getRegistrations(Long activityId, RegistrationStatus status, Pageable pageable);

    void updateStatus(Long id, RegistrationStatus status);

    void cancelRegistration(Long id);
}
