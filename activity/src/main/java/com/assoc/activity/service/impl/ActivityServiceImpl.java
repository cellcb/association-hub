package com.assoc.activity.service.impl;

import com.assoc.activity.dto.ActivityListResponse;
import com.assoc.activity.dto.ActivityRequest;
import com.assoc.activity.dto.ActivityResponse;
import com.assoc.activity.entity.Activity;
import com.assoc.activity.entity.ActivityStatus;
import com.assoc.activity.entity.ActivityType;
import com.assoc.activity.repository.ActivityRepository;
import com.assoc.activity.service.ActivityService;
import com.assoc.common.event.VectorizeEvent;
import com.assoc.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ActivityServiceImpl implements ActivityService {

    private final ActivityRepository activityRepository;
    private final ApplicationEventPublisher eventPublisher;

    private static final List<ActivityStatus> ACTIVE_STATUSES = List.of(
            ActivityStatus.UPCOMING, ActivityStatus.ONGOING
    );

    @Override
    public Page<ActivityListResponse> getActiveActivities(Pageable pageable) {
        return activityRepository.findByStatusIn(ACTIVE_STATUSES, pageable)
                .map(this::toListResponse);
    }

    @Override
    public Page<ActivityListResponse> getActivitiesByType(ActivityType type, Pageable pageable) {
        return activityRepository.findByStatusInAndType(ACTIVE_STATUSES, type, pageable)
                .map(this::toListResponse);
    }

    @Override
    public Page<ActivityListResponse> searchActivities(String keyword, Pageable pageable) {
        return activityRepository.searchByKeyword(keyword, ACTIVE_STATUSES, pageable)
                .map(this::toListResponse);
    }

    @Override
    public ActivityResponse getActivityById(Long id) {
        Activity activity = activityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("活动不存在: " + id));
        return toResponse(activity);
    }

    @Override
    public Page<ActivityListResponse> getAllActivities(ActivityStatus status, ActivityType type, Pageable pageable) {
        if (status != null && type != null) {
            return activityRepository.findByStatusAndType(status, type, pageable)
                    .map(this::toListResponse);
        } else if (status != null) {
            return activityRepository.findByStatus(status, pageable)
                    .map(this::toListResponse);
        } else if (type != null) {
            return activityRepository.findByType(type, pageable)
                    .map(this::toListResponse);
        }
        return activityRepository.findAll(pageable).map(this::toListResponse);
    }

    @Override
    @Transactional
    public ActivityResponse createActivity(ActivityRequest request) {
        Activity activity = new Activity();
        mapRequestToEntity(request, activity);
        activity.setStatus(request.getStatus() != null ? request.getStatus() : ActivityStatus.UPCOMING);
        activity.setRegisteredCount(0);

        activity = activityRepository.save(activity);
        publishVectorizeEvent(activity, VectorizeEvent.EventAction.UPSERT);
        return toResponse(activity);
    }

    @Override
    @Transactional
    public ActivityResponse updateActivity(Long id, ActivityRequest request) {
        Activity activity = activityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("活动不存在: " + id));

        mapRequestToEntity(request, activity);
        if (request.getStatus() != null) {
            activity.setStatus(request.getStatus());
        }

        activity = activityRepository.save(activity);
        publishVectorizeEvent(activity, VectorizeEvent.EventAction.UPSERT);
        return toResponse(activity);
    }

    @Override
    @Transactional
    public void deleteActivity(Long id) {
        if (!activityRepository.existsById(id)) {
            throw new ResourceNotFoundException("活动不存在: " + id);
        }
        activityRepository.deleteById(id);
        eventPublisher.publishEvent(VectorizeEvent.builder()
                .entityType("activity")
                .entityId(id)
                .action(VectorizeEvent.EventAction.DELETE)
                .build());
    }

    @Override
    @Transactional
    public void updateStatus(Long id, ActivityStatus status) {
        Activity activity = activityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("活动不存在: " + id));
        activity.setStatus(status);
        activityRepository.save(activity);
    }

    private void mapRequestToEntity(ActivityRequest request, Activity activity) {
        activity.setTitle(request.getTitle());
        activity.setType(request.getType());
        activity.setDate(request.getDate());
        activity.setTime(request.getTime());
        activity.setEndDate(request.getEndDate());
        activity.setEndTime(request.getEndTime());
        activity.setRegistrationStartDate(request.getRegistrationStartDate());
        activity.setRegistrationStartTime(request.getRegistrationStartTime());
        activity.setRegistrationEndDate(request.getRegistrationEndDate());
        activity.setRegistrationEndTime(request.getRegistrationEndTime());
        activity.setLocation(request.getLocation());
        activity.setParticipantsLimit(request.getParticipantsLimit());
        activity.setDescription(request.getDescription());
        activity.setDetailedDescription(request.getDetailedDescription());
        activity.setSpeaker(request.getSpeaker());
        activity.setSpeakerBio(request.getSpeakerBio());
        activity.setOrganization(request.getOrganization());
        activity.setFee(request.getFee());
        activity.setCapacity(request.getCapacity());
        activity.setCoverImage(request.getCoverImage());
        activity.setVenue(request.getVenue());
        activity.setContact(request.getContact());
        activity.setBenefits(request.getBenefits());
        activity.setAgenda(request.getAgenda());
    }

    private ActivityListResponse toListResponse(Activity activity) {
        ActivityListResponse response = new ActivityListResponse();
        response.setId(activity.getId());
        response.setTitle(activity.getTitle());
        response.setType(activity.getType());
        response.setTypeName(getTypeName(activity.getType()));
        response.setDate(activity.getDate());
        response.setTime(activity.getTime());
        response.setEndDate(activity.getEndDate());
        response.setEndTime(activity.getEndTime());
        response.setRegistrationStartDate(activity.getRegistrationStartDate());
        response.setRegistrationStartTime(activity.getRegistrationStartTime());
        response.setRegistrationEndDate(activity.getRegistrationEndDate());
        response.setRegistrationEndTime(activity.getRegistrationEndTime());
        response.setLocation(activity.getLocation());
        response.setStatus(activity.getStatus());
        response.setStatusName(getStatusName(activity.getStatus()));
        response.setDescription(activity.getDescription());
        response.setOrganization(activity.getOrganization());
        response.setFee(activity.getFee());
        response.setCapacity(activity.getCapacity());
        response.setRegisteredCount(activity.getRegisteredCount());
        response.setCoverImage(activity.getCoverImage());
        return response;
    }

    private ActivityResponse toResponse(Activity activity) {
        ActivityResponse response = new ActivityResponse();
        response.setId(activity.getId());
        response.setTitle(activity.getTitle());
        response.setType(activity.getType());
        response.setTypeName(getTypeName(activity.getType()));
        response.setDate(activity.getDate());
        response.setTime(activity.getTime());
        response.setEndDate(activity.getEndDate());
        response.setEndTime(activity.getEndTime());
        response.setRegistrationStartDate(activity.getRegistrationStartDate());
        response.setRegistrationStartTime(activity.getRegistrationStartTime());
        response.setRegistrationEndDate(activity.getRegistrationEndDate());
        response.setRegistrationEndTime(activity.getRegistrationEndTime());
        response.setLocation(activity.getLocation());
        response.setParticipantsLimit(activity.getParticipantsLimit());
        response.setStatus(activity.getStatus());
        response.setStatusName(getStatusName(activity.getStatus()));
        response.setDescription(activity.getDescription());
        response.setDetailedDescription(activity.getDetailedDescription());
        response.setSpeaker(activity.getSpeaker());
        response.setSpeakerBio(activity.getSpeakerBio());
        response.setOrganization(activity.getOrganization());
        response.setFee(activity.getFee());
        response.setCapacity(activity.getCapacity());
        response.setRegisteredCount(activity.getRegisteredCount());
        response.setCoverImage(activity.getCoverImage());
        response.setCreatedTime(activity.getCreatedTime());
        response.setUpdatedTime(activity.getUpdatedTime());
        response.setVenue(activity.getVenue());
        response.setContact(activity.getContact());
        response.setBenefits(activity.getBenefits());
        response.setAgenda(activity.getAgenda());
        return response;
    }

    private String getTypeName(ActivityType type) {
        if (type == null) return null;
        return switch (type) {
            case CONFERENCE -> "会议";
            case TRAINING -> "培训";
            case SEMINAR -> "研讨会";
            case EXHIBITION -> "展览";
            case COMPETITION -> "竞赛";
            case OTHER -> "其他";
        };
    }

    private String getStatusName(ActivityStatus status) {
        if (status == null) return null;
        return switch (status) {
            case UPCOMING -> "即将开始";
            case ONGOING -> "进行中";
            case ENDED -> "已结束";
            case CANCELLED -> "已取消";
        };
    }

    private void publishVectorizeEvent(Activity activity, VectorizeEvent.EventAction action) {
        Map<String, String> fields = new HashMap<>();
        fields.put("title", nullToEmpty(activity.getTitle()));
        fields.put("description", nullToEmpty(activity.getDescription()));
        fields.put("detailedDescription", nullToEmpty(activity.getDetailedDescription()));
        fields.put("speaker", nullToEmpty(activity.getSpeaker()));
        fields.put("speakerBio", nullToEmpty(activity.getSpeakerBio()));
        fields.put("agenda", nullToEmpty(activity.getAgenda()));
        fields.put("benefits", nullToEmpty(activity.getBenefits()));
        fields.put("venue", nullToEmpty(activity.getVenue()));
        fields.put("organization", nullToEmpty(activity.getOrganization()));
        fields.put("location", nullToEmpty(activity.getLocation()));
        if (activity.getType() != null) {
            fields.put("typeName", getTypeName(activity.getType()));
        }

        Map<String, Object> metadata = new HashMap<>();
        metadata.put("title", activity.getTitle());
        if (activity.getType() != null) {
            metadata.put("type", activity.getType().name());
            metadata.put("typeName", getTypeName(activity.getType()));
        }

        eventPublisher.publishEvent(VectorizeEvent.builder()
                .entityType("activity")
                .entityId(activity.getId())
                .action(action)
                .fields(fields)
                .metadata(metadata)
                .build());
    }

    private String nullToEmpty(String s) {
        return s == null ? "" : s;
    }

    @Override
    public String getEntityType() {
        return "activity";
    }

    @Override
    public int resyncVectors() {
        List<Activity> allActivities = activityRepository.findAll();
        for (Activity activity : allActivities) {
            publishVectorizeEvent(activity, VectorizeEvent.EventAction.UPSERT);
        }
        return allActivities.size();
    }
}
