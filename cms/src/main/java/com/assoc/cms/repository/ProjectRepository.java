package com.assoc.cms.repository;

import com.assoc.cms.entity.Project;
import com.assoc.cms.entity.ProjectCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

    Page<Project> findByStatus(Integer status, Pageable pageable);

    Page<Project> findByCategory(ProjectCategory category, Pageable pageable);

    Page<Project> findByStatusAndCategory(Integer status, ProjectCategory category, Pageable pageable);

    @Query("SELECT p FROM Project p WHERE p.status = :status AND " +
           "(LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.location) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Project> searchByKeyword(@Param("keyword") String keyword, @Param("status") Integer status, Pageable pageable);

    @Modifying
    @Query("UPDATE Project p SET p.views = p.views + 1 WHERE p.id = :id")
    void incrementViews(@Param("id") Long id);

    long countByStatus(Integer status);

    long countByCategory(ProjectCategory category);

    long countByCategoryId(Long categoryId);
}
