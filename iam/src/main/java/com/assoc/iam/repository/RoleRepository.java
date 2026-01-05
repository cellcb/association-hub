package com.assoc.iam.repository;

import com.assoc.iam.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
    
    /**
     * Find role by code
     */
    Optional<Role> findByCode(String code);
    
    /**
     * Check if role code exists
     */
    boolean existsByCode(String code);
}
