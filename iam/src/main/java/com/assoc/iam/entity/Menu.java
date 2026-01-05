package com.assoc.iam.entity;

import com.assoc.common.entity.AuditableEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

/**
 * 菜单实体类
 * 支持多级树形结构的菜单管理，包含目录、菜单、按钮三种类型
 * 与权限系统集成，支持基于角色的菜单访问控制
 */
@Data
@Entity
@Table(name = "iam_menu")
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
public class Menu extends AuditableEntity {
    
    /** 菜单ID */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    /** 菜单名称 */
    @Column(name = "name", nullable = false, length = 50)
    private String name;
    
    /** 菜单编码，全局唯一 */
    @Column(name = "code", nullable = false, unique = true, length = 50)
    private String code;
    
    /** 前端路由路径 */
    @Column(name = "path", length = 200)
    private String path;
    
    /** 菜单图标类名 */
    @Column(name = "icon", length = 50)
    private String icon;
    
    /** 前端组件路径 */
    @Column(name = "component", length = 200)
    private String component;
    
    /** 父菜单ID，根菜单为null */
    @Column(name = "parent_id")
    private Long parentId;
    
    // 注意：parent 和 children 通过 SQL 查询获取，不使用 JPA 关系映射
    // 避免懒加载问题和 N+1 查询性能问题
    
    /** 菜单层级，根菜单为1 */
    @Column(name = "level")
    private Integer level = 1;
    
    /** 排序序号，数值越小越靠前 */
    @Column(name = "sort_order")
    private Integer sortOrder = 0;
    
    /** 菜单类型：目录(CATALOG)、菜单(MENU)、按钮(BUTTON) */
    @Enumerated(EnumType.STRING)
    @Column(name = "menu_type", length = 20)
    private MenuType menuType = MenuType.MENU;
    
    /** 是否外部链接 */
    @Column(name = "external")
    private Boolean external = false;
    
    /** 是否缓存页面 */
    @Column(name = "cache")
    private Boolean cache = false;
    
    /** 是否隐藏菜单 */
    @Column(name = "hidden")
    private Boolean hidden = false;
    
    /** 菜单状态：1-启用，0-禁用 */
    @Column(name = "status")
    private Integer status = 1;

    // 注意：permissions 通过 SQL 查询获取，不使用 JPA 关系映射
    // 通过 MenuRepository 中的自定义查询方法获取权限信息

    /**
     * 判断是否为根菜单
     * @return true-根菜单，false-非根菜单
     */
    public boolean isRoot() {
        return parentId == null;
    }
    
    /**
     * 判断是否有子菜单
     * 注意：需要通过 Repository 查询数据库来判断，此方法仅作为占位符
     * @return true-有子菜单，false-无子菜单
     */
    public boolean hasChildren() {
        // 此方法需要通过 MenuRepository.hasActiveChildren(this.id) 来实现
        return false;
    }
    
    /**
     * 判断菜单是否启用状态
     * @return true-启用，false-禁用
     */
    public boolean isActive() {
        return status != null && status == 1;
    }
    
    /**
     * 判断菜单是否可见
     * @return true-可见，false-隐藏
     */
    public boolean isVisible() {
        return !Boolean.TRUE.equals(hidden) && isActive();
    }
    
    /**
     * 判断是否为目录类型
     * @return true-目录，false-非目录
     */
    public boolean isCatalog() {
        return MenuType.CATALOG.equals(menuType);
    }
    
    /**
     * 判断是否为菜单类型
     * @return true-菜单，false-非菜单
     */
    public boolean isMenu() {
        return MenuType.MENU.equals(menuType);
    }
    
    /**
     * 判断是否为按钮类型
     * @return true-按钮，false-非按钮
     */
    public boolean isButton() {
        return MenuType.BUTTON.equals(menuType);
    }
    
    /**
     * 菜单类型枚举
     */
    public enum MenuType {
        /** 目录/文件夹 - 用于组织菜单结构，通常不对应具体页面 */
        CATALOG,
        /** 菜单项 - 对应具体的路由页面 */
        MENU,
        /** 按钮/操作 - 页面内的功能按钮，不对应路由 */
        BUTTON
    }
}
