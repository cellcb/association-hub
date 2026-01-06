package com.assoc.activity.repository;

import com.assoc.activity.entity.Activity;
import com.assoc.activity.entity.ActivityStatus;
import com.assoc.activity.entity.ActivityType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ActivityRepository extends JpaRepository<Activity, Long> {

    Page<Activity> findByStatus(ActivityStatus status, Pageable pageable);

    Page<Activity> findByType(ActivityType type, Pageable pageable);

    Page<Activity> findByStatusAndType(ActivityStatus status, ActivityType type, Pageable pageable);

    @Query("SELECT a FROM Activity a WHERE a.status IN :statuses")
    Page<Activity> findByStatusIn(@Param("statuses") List<ActivityStatus> statuses, Pageable pageable);

    @Query("SELECT a FROM Activity a WHERE a.status IN :statuses AND a.type = :type")
    Page<Activity> findByStatusInAndType(@Param("statuses") List<ActivityStatus> statuses,
                                          @Param("type") ActivityType type, Pageable pageable);

    @Query("SELECT a FROM Activity a WHERE a.status IN :statuses AND " +
           "(LOWER(a.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(a.description) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Activity> searchByKeyword(@Param("keyword") String keyword,
                                   @Param("statuses") List<ActivityStatus> statuses, Pageable pageable);

    List<Activity> findByDateBetweenAndStatusIn(LocalDate startDate, LocalDate endDate,
                                                 List<ActivityStatus> statuses);

    @Modifying
    @Query("UPDATE Activity a SET a.registeredCount = a.registeredCount + 1 WHERE a.id = :id")
    void incrementRegisteredCount(@Param("id") Long id);

    @Modifying
    @Query("UPDATE Activity a SET a.registeredCount = a.registeredCount - 1 WHERE a.id = :id AND a.registeredCount > 0")
    void decrementRegisteredCount(@Param("id") Long id);

    long countByStatus(ActivityStatus status);

    long countByType(ActivityType type);
}
