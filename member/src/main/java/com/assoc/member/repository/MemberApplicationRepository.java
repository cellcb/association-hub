package com.assoc.member.repository;

import com.assoc.member.entity.ApplicationStatus;
import com.assoc.member.entity.MemberApplication;
import com.assoc.member.entity.MemberType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MemberApplicationRepository extends JpaRepository<MemberApplication, Long> {

    /**
     * Check if username exists in applications
     */
    boolean existsByUsername(String username);

    /**
     * Check if email exists in applications
     */
    boolean existsByEmail(String email);

    /**
     * Find by username
     */
    Optional<MemberApplication> findByUsername(String username);

    /**
     * Find by email
     */
    Optional<MemberApplication> findByEmail(String email);

    /**
     * Find applications by status
     */
    Page<MemberApplication> findByStatus(ApplicationStatus status, Pageable pageable);

    /**
     * Find applications by member type
     */
    Page<MemberApplication> findByMemberType(MemberType memberType, Pageable pageable);

    /**
     * Find applications by status and member type
     */
    Page<MemberApplication> findByStatusAndMemberType(ApplicationStatus status, MemberType memberType, Pageable pageable);

    /**
     * Search applications by keyword (username, email, phone)
     */
    @Query("SELECT a FROM MemberApplication a WHERE " +
           "LOWER(a.username) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(a.email) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "a.phone LIKE CONCAT('%', :keyword, '%')")
    Page<MemberApplication> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

    /**
     * Count applications by status
     */
    long countByStatus(ApplicationStatus status);

    /**
     * Count pending applications
     */
    default long countPending() {
        return countByStatus(ApplicationStatus.PENDING);
    }
}
