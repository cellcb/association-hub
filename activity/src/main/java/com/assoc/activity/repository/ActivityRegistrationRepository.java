package com.assoc.activity.repository;

import com.assoc.activity.entity.ActivityRegistration;
import com.assoc.activity.entity.RegistrationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ActivityRegistrationRepository extends JpaRepository<ActivityRegistration, Long> {

    Page<ActivityRegistration> findByActivityId(Long activityId, Pageable pageable);

    Page<ActivityRegistration> findByActivityIdAndStatus(Long activityId, RegistrationStatus status, Pageable pageable);

    List<ActivityRegistration> findByUserId(Long userId);

    Page<ActivityRegistration> findByUserIdOrderByCreatedTimeDesc(Long userId, Pageable pageable);

    Optional<ActivityRegistration> findByActivityIdAndPhone(Long activityId, String phone);

    Optional<ActivityRegistration> findByActivityIdAndUserId(Long activityId, Long userId);

    boolean existsByActivityIdAndPhone(Long activityId, String phone);

    boolean existsByActivityIdAndUserId(Long activityId, Long userId);

    long countByActivityIdAndStatus(Long activityId, RegistrationStatus status);

    long countByActivityId(Long activityId);

    void deleteByActivityId(Long activityId);
}
