package com.assoc.activity.service;

import com.assoc.activity.dto.ActivityListResponse;
import com.assoc.activity.dto.ActivityRequest;
import com.assoc.activity.dto.ActivityResponse;
import com.assoc.activity.entity.ActivityStatus;
import com.assoc.activity.entity.ActivityType;
import com.assoc.common.event.VectorSyncable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ActivityService extends VectorSyncable {

    Page<ActivityListResponse> getActiveActivities(Pageable pageable);

    Page<ActivityListResponse> getActivitiesByType(ActivityType type, Pageable pageable);

    Page<ActivityListResponse> searchActivities(String keyword, Pageable pageable);

    ActivityResponse getActivityById(Long id);

    // Admin methods
    Page<ActivityListResponse> getAllActivities(ActivityStatus status, ActivityType type, Pageable pageable);

    ActivityResponse createActivity(ActivityRequest request);

    ActivityResponse updateActivity(Long id, ActivityRequest request);

    void deleteActivity(Long id);

    void updateStatus(Long id, ActivityStatus status);
}
