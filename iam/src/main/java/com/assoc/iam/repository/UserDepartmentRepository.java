package com.assoc.iam.repository;

import com.assoc.iam.entity.UserDepartment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserDepartmentRepository extends JpaRepository<UserDepartment, Long> {
    
    /**
     * Find all user-department relationships by user ID
     */
    List<UserDepartment> findByUserId(Long userId);
    
    /**
     * Find all user-department relationships by department ID
     */
    List<UserDepartment> findByDepartmentId(Long departmentId);
    
    /**
     * Find active user-department relationships by user ID
     */
    @Query("SELECT ud FROM UserDepartment ud WHERE ud.userId = :userId AND ud.status = 1 " +
           "AND (ud.startDate IS NULL OR ud.startDate <= :now) " +
           "AND (ud.endDate IS NULL OR ud.endDate >= :now)")
    List<UserDepartment> findActiveByUserId(@Param("userId") Long userId, @Param("now") LocalDate now);
    
    /**
     * Find active user-department relationships by department ID
     */
    @Query("SELECT ud FROM UserDepartment ud WHERE ud.departmentId = :departmentId AND ud.status = 1 " +
           "AND (ud.startDate IS NULL OR ud.startDate <= :now) " +
           "AND (ud.endDate IS NULL OR ud.endDate >= :now)")
    List<UserDepartment> findActiveByDepartmentId(@Param("departmentId") Long departmentId, @Param("now") LocalDate now);
    
    /**
     * Find user's primary department relationship
     */
    @Query("SELECT ud FROM UserDepartment ud WHERE ud.userId = :userId AND ud.isPrimary = true AND ud.status = 1 " +
           "AND (ud.startDate IS NULL OR ud.startDate <= :now) " +
           "AND (ud.endDate IS NULL OR ud.endDate >= :now)")
    Optional<UserDepartment> findPrimaryByUserId(@Param("userId") Long userId, @Param("now") LocalDate now);
    
    /**
     * Find specific user-department relationship
     */
    Optional<UserDepartment> findByUserIdAndDepartmentIdAndStatus(Long userId, Long departmentId, Integer status);
    
    /**
     * Check if user-department relationship exists and is active
     */
    @Query("SELECT COUNT(ud) > 0 FROM UserDepartment ud WHERE ud.userId = :userId AND ud.departmentId = :departmentId " +
           "AND ud.status = 1 AND (ud.startDate IS NULL OR ud.startDate <= :now) " +
           "AND (ud.endDate IS NULL OR ud.endDate >= :now)")
    boolean existsActiveRelationship(@Param("userId") Long userId, @Param("departmentId") Long departmentId, 
                                     @Param("now") LocalDate now);
    
    /**
     * Count active users in department
     */
    @Query("SELECT COUNT(DISTINCT ud.userId) FROM UserDepartment ud WHERE ud.departmentId = :departmentId " +
           "AND ud.status = 1 AND (ud.startDate IS NULL OR ud.startDate <= :now) " +
           "AND (ud.endDate IS NULL OR ud.endDate >= :now)")
    long countActiveUsersByDepartmentId(@Param("departmentId") Long departmentId, @Param("now") LocalDate now);
    
    /**
     * Find all user IDs in department (including sub-departments)
     */
    @Query("SELECT DISTINCT ud.userId FROM UserDepartment ud " +
           "JOIN ud.department d WHERE (d.path LIKE :pathPrefix OR d.id = :departmentId) " +
           "AND ud.status = 1 AND (ud.startDate IS NULL OR ud.startDate <= :now) " +
           "AND (ud.endDate IS NULL OR ud.endDate >= :now)")
    List<Long> findUserIdsByDepartmentPath(@Param("departmentId") Long departmentId, 
                                           @Param("pathPrefix") String pathPrefix, 
                                           @Param("now") LocalDate now);
    
    /**
     * Find expired relationships
     */
    @Query("SELECT ud FROM UserDepartment ud WHERE ud.endDate < :now AND ud.status = 1")
    List<UserDepartment> findExpiredRelationships(@Param("now") LocalDate now);
    
    /**
     * Clear user's primary department flag
     */
    @Modifying
    @Query("UPDATE UserDepartment ud SET ud.isPrimary = false, ud.updatedTime = CURRENT_TIMESTAMP " +
           "WHERE ud.userId = :userId AND ud.isPrimary = true")
    int clearUserPrimaryFlag(@Param("userId") Long userId);
    
    /**
     * Set user's primary department
     */
    @Modifying
    @Query("UPDATE UserDepartment ud SET ud.isPrimary = true, ud.updatedTime = CURRENT_TIMESTAMP " +
           "WHERE ud.userId = :userId AND ud.departmentId = :departmentId AND ud.status = 1")
    int setUserPrimaryDepartment(@Param("userId") Long userId, @Param("departmentId") Long departmentId);
    
    /**
     * Deactivate user-department relationship
     */
    @Modifying
    @Query("UPDATE UserDepartment ud SET ud.status = 0, ud.endDate = :endDate, " +
           "ud.updatedTime = CURRENT_TIMESTAMP, ud.updatedBy = :updatedBy " +
           "WHERE ud.userId = :userId AND ud.departmentId = :departmentId AND ud.status = 1")
    int deactivateRelationship(@Param("userId") Long userId, @Param("departmentId") Long departmentId,
                               @Param("endDate") LocalDate endDate, @Param("updatedBy") Long updatedBy);
    
    /**
     * Find users by position in department
     */
    @Query("SELECT ud FROM UserDepartment ud WHERE ud.departmentId = :departmentId " +
           "AND ud.position = :position AND ud.status = 1 " +
           "AND (ud.startDate IS NULL OR ud.startDate <= :now) " +
           "AND (ud.endDate IS NULL OR ud.endDate >= :now)")
    List<UserDepartment> findByDepartmentIdAndPosition(@Param("departmentId") Long departmentId, 
                                                        @Param("position") String position,
                                                        @Param("now") LocalDate now);
}
