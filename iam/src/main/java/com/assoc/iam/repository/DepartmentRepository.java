package com.assoc.iam.repository;

import com.assoc.iam.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {
    
    Optional<Department> findByCode(String code);
    
    List<Department> findByParentIdOrderBySortOrderAsc(Long parentId);
    
    List<Department> findByParentIdIsNullOrderBySortOrderAsc();
    
    List<Department> findByStatusOrderBySortOrderAsc(Integer status);
    
    List<Department> findByNameContainingIgnoreCaseAndStatusOrderBySortOrderAsc(String name, Integer status);
    
    @Query("SELECT d FROM Department d WHERE d.parentId = :parentId AND d.status = 1 ORDER BY d.sortOrder ASC")
    List<Department> findActiveChildrenByParentId(@Param("parentId") Long parentId);
    
    @Query("SELECT d FROM Department d WHERE d.parentId IS NULL AND d.status = 1 ORDER BY d.sortOrder ASC")
    List<Department> findActiveRootDepartments();
    
    @Query("SELECT CASE WHEN COUNT(d) > 0 THEN true ELSE false END FROM Department d WHERE d.parentId = :parentId")
    boolean hasChildren(@Param("parentId") Long parentId);
    
    @Query("SELECT d FROM Department d WHERE d.path LIKE CONCAT(:path, '%') AND d.status = 1 ORDER BY d.level ASC, d.sortOrder ASC")
    List<Department> findDescendantsByPath(@Param("path") String path);
    
    @Query("SELECT d FROM Department d WHERE d.level <= :level AND d.status = 1 ORDER BY d.level ASC, d.sortOrder ASC")
    List<Department> findByLevelLessThanEqual(@Param("level") Integer level);
    
    boolean existsByCode(String code);
    
    boolean existsByParentIdAndName(Long parentId, String name);
}
