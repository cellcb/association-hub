package com.assoc.iam.repository;

import com.assoc.iam.entity.Permission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PermissionRepository extends JpaRepository<Permission, Long> {
    
    /**
     * Find permission by code
     */
    Optional<Permission> findByCode(String code);
    
    /**
     * Check if permission code exists
     */
    boolean existsByCode(String code);
    
    /**
     * Find permissions by status
     */
    List<Permission> findByStatus(Integer status);
    
    /**
     * Find permissions by resource containing pattern
     */
    List<Permission> findByResourceContaining(String resourcePattern);
}
