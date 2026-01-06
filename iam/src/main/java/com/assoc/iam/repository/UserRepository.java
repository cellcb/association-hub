package com.assoc.iam.repository;

import com.assoc.iam.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    /**
     * Find user by username
     */
    Optional<User> findByUsername(String username);
    
    /**
     * Find user by email
     */
    Optional<User> findByEmail(String email);
    
    /**
     * Find active user by username with roles and permissions
     */
    @Query("SELECT u FROM User u " +
           "LEFT JOIN FETCH u.roles r " +
           "LEFT JOIN FETCH r.permissions " +
           "WHERE u.username = :username AND u.status = 1")
    Optional<User> findActiveUserWithRolesAndPermissions(@Param("username") String username);

    /**
     * Find active user by username or email with roles and permissions
     */
    @Query("SELECT u FROM User u " +
           "LEFT JOIN FETCH u.roles r " +
           "LEFT JOIN FETCH r.permissions " +
           "WHERE (u.username = :identifier OR u.email = :identifier) AND u.status = 1")
    Optional<User> findActiveUserByUsernameOrEmailWithRolesAndPermissions(@Param("identifier") String identifier);
    
    
    /**
     * Search users by keyword (username, realName, email)
     */
    @Query("SELECT u FROM User u WHERE " +
           "u.username LIKE %:keyword% OR " +
           "u.realName LIKE %:keyword% OR " +
           "u.email LIKE %:keyword%")
    Page<User> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);
    
    /**
     * Find users by status
     */
    Page<User> findByStatus(Integer status, Pageable pageable);
    
    
    /**
     * Check if username exists
     */
    boolean existsByUsername(String username);

    /**
     * Check if email exists
     */
    boolean existsByEmail(String email);
    
    /**
     * Check if username exists excluding specific user ID
     */
    boolean existsByUsernameAndIdNot(String username, Long id);
    
    /**
     * Check if email exists excluding specific user ID
     */
    boolean existsByEmailAndIdNot(String email, Long id);
    
    /**
     * Count users by status
     */
    long countByStatus(Integer status);
    
    /**
     * Count active users (status = 1)
     */
    @Query("SELECT COUNT(u) FROM User u WHERE u.status = 1")
    long countActiveUsers();
    
    /**
     * Count disabled users (status = 0)
     */
    @Query("SELECT COUNT(u) FROM User u WHERE u.status = 0")
    long countDisabledUsers();
    
    /**
     * Find user by ID with roles and permissions for permission checking
     */
    @Query("SELECT u FROM User u " +
           "LEFT JOIN FETCH u.roles r " +
           "LEFT JOIN FETCH r.permissions " +
           "WHERE u.id = :id")
    Optional<User> findByIdWithRolesAndPermissions(@Param("id") Long id);
}
