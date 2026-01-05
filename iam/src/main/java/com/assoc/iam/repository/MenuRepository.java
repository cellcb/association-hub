package com.assoc.iam.repository;

import com.assoc.iam.entity.Menu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MenuRepository extends JpaRepository<Menu, Long> {

    /**
     * Find menu by code
     */
    Optional<Menu> findByCode(String code);

    /**
     * Find all menus by status, ordered by level, sort order and id
     */
    @Query("SELECT m FROM Menu m WHERE m.status = :status ORDER BY m.level ASC, m.sortOrder ASC, m.id ASC")
    List<Menu> findByStatusOrderByLevelAndSortOrder(@Param("status") Integer status);

    /**
     * Find all active menus ordered by level, sort order and id
     */
    @Query("SELECT m FROM Menu m WHERE m.status = 1 ORDER BY m.level ASC, m.sortOrder ASC, m.id ASC")
    List<Menu> findAllActiveMenusOrdered();

    /**
     * Find root menus (parent_id is null) by status
     */
    @Query("SELECT m FROM Menu m WHERE m.parentId IS NULL AND m.status = :status ORDER BY m.sortOrder ASC, m.id ASC")
    List<Menu> findRootMenusByStatus(@Param("status") Integer status);

    /**
     * Find all active root menus
     */
    @Query("SELECT m FROM Menu m WHERE m.parentId IS NULL AND m.status = 1 ORDER BY m.sortOrder ASC, m.id ASC")
    List<Menu> findActiveRootMenus();

    /**
     * Find children menus by parent id and status
     */
    @Query("SELECT m FROM Menu m WHERE m.parentId = :parentId AND m.status = :status ORDER BY m.sortOrder ASC, m.id ASC")
    List<Menu> findByParentIdAndStatus(@Param("parentId") Long parentId, @Param("status") Integer status);

    /**
     * Find active children menus by parent id
     */
    @Query("SELECT m FROM Menu m WHERE m.parentId = :parentId AND m.status = 1 ORDER BY m.sortOrder ASC, m.id ASC")
    List<Menu> findActiveByParentId(@Param("parentId") Long parentId);

    /**
     * Find menus by name containing (case insensitive)
     */
    @Query("SELECT m FROM Menu m WHERE LOWER(m.name) LIKE LOWER(CONCAT('%', :name, '%')) AND m.status = 1 ORDER BY m.level ASC, m.sortOrder ASC")
    List<Menu> findByNameContainingIgnoreCase(@Param("name") String name);

    /**
     * Find menus by menu type and status
     */
    @Query("SELECT m FROM Menu m WHERE m.menuType = :menuType AND m.status = :status ORDER BY m.level ASC, m.sortOrder ASC")
    List<Menu> findByMenuTypeAndStatus(@Param("menuType") Menu.MenuType menuType, @Param("status") Integer status);

    /**
     * Find menus that user can access based on permissions - 使用原生SQL避免关联映射
     */
    @Query(value = """
        SELECT DISTINCT m.* FROM iam_menu m
        JOIN iam_menu_permission mp ON m.id = mp.menu_id
        JOIN iam_permission p ON mp.permission_id = p.id
        JOIN iam_role_permission rp ON p.id = rp.permission_id
        JOIN iam_role r ON rp.role_id = r.id
        JOIN iam_user_role ur ON r.id = ur.role_id
        JOIN iam_user u ON ur.user_id = u.id
        WHERE u.id = :userId
          AND m.status = 1
          AND u.status = 1
          AND r.status = 1
          AND p.status = 1
        ORDER BY m.level ASC, m.sort_order ASC, m.id ASC
        """, nativeQuery = true)
    List<Menu> findAccessibleMenusByUserId(@Param("userId") Long userId);

    /**
     * Check if menu has children
     */
    @Query("SELECT COUNT(m) > 0 FROM Menu m WHERE m.parentId = :menuId AND m.status = 1")
    boolean hasActiveChildren(@Param("menuId") Long menuId);

    /**
     * Find menu permission codes by menu id - 使用原生SQL获取权限代码
     */
    @Query(value = """
        SELECT p.code FROM iam_permission p
        JOIN iam_menu_permission mp ON p.id = mp.permission_id
        WHERE mp.menu_id = :menuId
          AND p.status = 1
        """, nativeQuery = true)
    List<String> findPermissionCodesByMenuId(@Param("menuId") Long menuId);

    /**
     * Find menu permission ids by menu id - 获取菜单关联的权限ID列表
     */
    @Query(value = """
        SELECT mp.permission_id FROM iam_menu_permission mp
        JOIN iam_permission p ON mp.permission_id = p.id
        WHERE mp.menu_id = :menuId
          AND p.status = 1
        """, nativeQuery = true)
    List<Long> findPermissionIdsByMenuId(@Param("menuId") Long menuId);

    /**
     * Find all descendants of a menu (for tree operations)
     */
    @Query(value = """
        WITH RECURSIVE menu_tree AS (
            SELECT id, parent_id, level FROM iam_menu
            WHERE id = :menuId
            UNION ALL
            SELECT m.id, m.parent_id, m.level FROM iam_menu m
            INNER JOIN menu_tree mt ON m.parent_id = mt.id
        )
        SELECT m.* FROM iam_menu m
        INNER JOIN menu_tree mt ON m.id = mt.id
        WHERE m.id != :menuId
          AND m.status = 1
        ORDER BY m.level ASC, m.sort_order ASC
        """, nativeQuery = true)
    List<Menu> findAllDescendants(@Param("menuId") Long menuId);

    /**
     * Count menus by parent id and status
     */
    @Query("SELECT COUNT(m) FROM Menu m WHERE m.parentId = :parentId AND m.status = :status")
    Long countByParentIdAndStatus(@Param("parentId") Long parentId, @Param("status") Integer status);

    /**
     * Delete menu permission associations by menu id
     */
    @Modifying
    @Query(value = "DELETE FROM iam_menu_permission WHERE menu_id = :menuId", nativeQuery = true)
    void deleteMenuPermissionsByMenuId(@Param("menuId") Long menuId);

    /**
     * Insert menu permission association
     */
    @Modifying
    @Query(value = """
        INSERT INTO iam_menu_permission (menu_id, permission_id, created_time, created_by)
        VALUES (:menuId, :permissionId, CURRENT_TIMESTAMP, :createdBy)
        """, nativeQuery = true)
    void insertMenuPermission(@Param("menuId") Long menuId,
                             @Param("permissionId") Long permissionId,
                             @Param("createdBy") Long createdBy);

    /**
     * Batch insert menu permissions - 批量插入菜单权限关联
     */
    @Modifying
    @Query(value = """
        INSERT INTO iam_menu_permission (menu_id, permission_id, created_time, created_by)
        SELECT :menuId, p.id, CURRENT_TIMESTAMP, :createdBy
        FROM iam_permission p
        WHERE p.id IN (:permissionIds)
          AND p.status = 1
        """, nativeQuery = true)
    void batchInsertMenuPermissions(@Param("menuId") Long menuId,
                                   @Param("permissionIds") List<Long> permissionIds,
                                   @Param("createdBy") Long createdBy);

    /**
     * Delete specific menu permission associations
     */
    @Modifying
    @Query(value = "DELETE FROM iam_menu_permission WHERE menu_id = :menuId AND permission_id IN (:permissionIds)", nativeQuery = true)
    void deleteMenuPermissions(@Param("menuId") Long menuId,
                              @Param("permissionIds") List<Long> permissionIds);
}
