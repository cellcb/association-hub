package com.assoc.cms.repository;

import com.assoc.cms.entity.Expert;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ExpertRepository extends JpaRepository<Expert, Long> {

    @Query("SELECT e FROM Expert e LEFT JOIN FETCH e.expertiseFields WHERE e.id = :id")
    Optional<Expert> findByIdWithExpertise(@Param("id") Long id);

    Page<Expert> findByStatus(Integer status, Pageable pageable);

    @Query("SELECT e FROM Expert e WHERE e.status = :status AND " +
           "(LOWER(e.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(e.organization) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(e.achievements) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Expert> searchByKeyword(@Param("keyword") String keyword, @Param("status") Integer status, Pageable pageable);

    @Query("SELECT DISTINCT e FROM Expert e JOIN e.expertiseFields ef WHERE ef.id = :fieldId AND e.status = 1")
    Page<Expert> findByExpertiseFieldId(@Param("fieldId") Long fieldId, Pageable pageable);

    @Query("SELECT DISTINCT e FROM Expert e JOIN e.expertiseFields ef WHERE ef.code = :fieldCode AND e.status = 1")
    Page<Expert> findByExpertiseFieldCode(@Param("fieldCode") String fieldCode, Pageable pageable);

    long countByStatus(Integer status);
}
