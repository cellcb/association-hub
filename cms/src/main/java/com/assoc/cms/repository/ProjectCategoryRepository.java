package com.assoc.cms.repository;

import com.assoc.cms.entity.ProjectCategoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectCategoryRepository extends JpaRepository<ProjectCategoryEntity, Long> {

    /**
     * Find all categories ordered by sortOrder
     */
    List<ProjectCategoryEntity> findAllByOrderBySortOrderAsc();

    /**
     * Find all active categories ordered by sortOrder
     */
    List<ProjectCategoryEntity> findByStatusOrderBySortOrderAsc(Integer status);

    /**
     * Find by code
     */
    Optional<ProjectCategoryEntity> findByCode(String code);

    /**
     * Check if code exists (excluding a specific id)
     */
    boolean existsByCodeAndIdNot(String code, Long id);

    /**
     * Check if code exists
     */
    boolean existsByCode(String code);
}
