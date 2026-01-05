package com.assoc.iam.service;

import com.assoc.iam.dto.MenuRequest;
import com.assoc.iam.dto.MenuResponse;
import com.assoc.iam.dto.MenuTreeResponse;
import com.assoc.iam.dto.PermissionResponse;
import com.assoc.iam.entity.Menu;
import com.assoc.iam.entity.Permission;
import com.assoc.iam.repository.MenuRepository;
import com.assoc.iam.repository.PermissionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MenuServiceImpl implements MenuService {

    private final MenuRepository menuRepository;
    private final PermissionRepository permissionRepository;

    @Override
    public List<MenuTreeResponse> getMenuTree() {
        List<Menu> allMenus = menuRepository.findAllActiveMenusOrdered();
        return buildMenuTree(allMenus);
    }

    @Override
    public List<MenuTreeResponse> getUserMenuTree(Long userId) {
        List<Menu> userMenus = menuRepository.findAccessibleMenusByUserId(userId);
        return buildMenuTree(userMenus);
    }

    @Override
    public List<MenuResponse> getAllMenus() {
        List<Menu> menus = menuRepository.findAllActiveMenusOrdered();
        return menus.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public MenuResponse getMenuById(Long id) {
        Menu menu = menuRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Menu not found with id: " + id));
        return convertToResponse(menu);
    }

    @Override
    public MenuResponse getMenuByCode(String code) {
        Menu menu = menuRepository.findByCode(code)
                .orElseThrow(() -> new RuntimeException("Menu not found with code: " + code));
        return convertToResponse(menu);
    }

    @Override
    public List<MenuResponse> getRootMenus() {
        List<Menu> rootMenus = menuRepository.findActiveRootMenus();
        return rootMenus.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<MenuResponse> getChildrenMenus(Long parentId) {
        List<Menu> children = menuRepository.findActiveByParentId(parentId);
        return children.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<MenuResponse> searchMenusByName(String name) {
        List<Menu> menus = menuRepository.findByNameContainingIgnoreCase(name);
        return menus.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public MenuResponse createMenu(MenuRequest request, Long operatorId) {
        if (existsByCode(request.getCode())) {
            throw new RuntimeException("Menu code already exists: " + request.getCode());
        }

        Menu menu = new Menu();
        copyPropertiesToEntity(request, menu);
        menu.setCreatedBy(operatorId);
        menu.setUpdatedBy(operatorId);

        // Set level based on parent
        if (request.getParentId() != null) {
            Menu parent = menuRepository.findById(request.getParentId())
                    .orElseThrow(() -> new RuntimeException("Parent menu not found"));
            menu.setLevel(parent.getLevel() + 1);
        } else {
            menu.setLevel(1);
        }

        Menu savedMenu = menuRepository.save(menu);

        // Associate permissions using SQL queries
        if (request.getPermissionIds() != null && !request.getPermissionIds().isEmpty()) {
            menuRepository.batchInsertMenuPermissions(
                savedMenu.getId(),
                new ArrayList<>(request.getPermissionIds()),
                operatorId
            );
        }

        log.info("Created menu: {} by user: {}", savedMenu.getCode(), operatorId);
        return convertToResponse(savedMenu);
    }

    @Override
    @Transactional
    public MenuResponse updateMenu(Long id, MenuRequest request, Long operatorId) {
        Menu menu = menuRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Menu not found with id: " + id));

        // Check code uniqueness if changed
        if (!menu.getCode().equals(request.getCode()) && existsByCode(request.getCode())) {
            throw new RuntimeException("Menu code already exists: " + request.getCode());
        }

        // Validate hierarchy if parent changed
        if (!Objects.equals(menu.getParentId(), request.getParentId())) {
            if (!validateMenuHierarchy(id, request.getParentId())) {
                throw new RuntimeException("Invalid menu hierarchy: circular reference detected");
            }
        }

        copyPropertiesToEntity(request, menu);
        menu.setUpdatedBy(operatorId);

        // Update level based on parent
        if (request.getParentId() != null) {
            Menu parent = menuRepository.findById(request.getParentId())
                    .orElseThrow(() -> new RuntimeException("Parent menu not found"));
            menu.setLevel(parent.getLevel() + 1);
        } else {
            menu.setLevel(1);
        }

        // Update permissions using SQL queries
        if (request.getPermissionIds() != null) {
            // Delete existing permissions
            menuRepository.deleteMenuPermissionsByMenuId(id);

            // Insert new permissions
            if (!request.getPermissionIds().isEmpty()) {
                menuRepository.batchInsertMenuPermissions(
                    id,
                    new ArrayList<>(request.getPermissionIds()),
                    operatorId
                );
            }
        }

        Menu savedMenu = menuRepository.save(menu);
        log.info("Updated menu: {} by user: {}", savedMenu.getCode(), operatorId);
        return convertToResponse(savedMenu);
    }

    @Override
    @Transactional
    public void deleteMenu(Long id, Long operatorId) {
        Menu menu = menuRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Menu not found with id: " + id));

        if (hasChildren(id)) {
            throw new RuntimeException("Cannot delete menu with children");
        }

        menuRepository.delete(menu);
        log.info("Deleted menu: {} by user: {}", menu.getCode(), operatorId);
    }

    @Override
    @Transactional
    public MenuResponse moveMenu(Long menuId, Long newParentId, Long operatorId) {
        Menu menu = menuRepository.findById(menuId)
                .orElseThrow(() -> new RuntimeException("Menu not found with id: " + menuId));

        if (!validateMenuHierarchy(menuId, newParentId)) {
            throw new RuntimeException("Invalid menu hierarchy: circular reference detected");
        }

        menu.setParentId(newParentId);
        menu.setUpdatedBy(operatorId);

        // Update level
        if (newParentId != null) {
            Menu parent = menuRepository.findById(newParentId)
                    .orElseThrow(() -> new RuntimeException("Parent menu not found"));
            menu.setLevel(parent.getLevel() + 1);
        } else {
            menu.setLevel(1);
        }

        Menu savedMenu = menuRepository.save(menu);
        log.info("Moved menu: {} to parent: {} by user: {}", menu.getCode(), newParentId, operatorId);
        return convertToResponse(savedMenu);
    }

    @Override
    public boolean existsByCode(String code) {
        return menuRepository.findByCode(code).isPresent();
    }

    @Override
    public boolean hasChildren(Long menuId) {
        return menuRepository.hasActiveChildren(menuId);
    }

    @Override
    public boolean validateMenuHierarchy(Long menuId, Long parentId) {
        if (parentId == null) {
            return true;
        }

        if (menuId.equals(parentId)) {
            return false;
        }

        List<Menu> descendants = menuRepository.findAllDescendants(menuId);
        return descendants.stream().noneMatch(menu -> menu.getId().equals(parentId));
    }

    private List<MenuTreeResponse> buildMenuTree(List<Menu> menus) {
        Map<Long, MenuTreeResponse> menuMap = menus.stream()
                .map(this::convertToTreeResponse)
                .collect(Collectors.toMap(MenuTreeResponse::getId, menu -> menu));

        List<MenuTreeResponse> rootMenus = new ArrayList<>();

        for (MenuTreeResponse menu : menuMap.values()) {
            if (menu.getParentId() == null) {
                rootMenus.add(menu);
            } else {
                MenuTreeResponse parent = menuMap.get(menu.getParentId());
                if (parent != null) {
                    if (parent.getChildren() == null) {
                        parent.setChildren(new ArrayList<>());
                    }
                    parent.getChildren().add(menu);
                }
            }
        }

        // Sort menus at each level
        sortMenuTree(rootMenus);
        return rootMenus;
    }

    private void sortMenuTree(List<MenuTreeResponse> menus) {
        if (menus == null || menus.isEmpty()) {
            return;
        }

        menus.sort((a, b) -> {
            int result = Integer.compare(a.getSortOrder(), b.getSortOrder());
            return result != 0 ? result : Long.compare(a.getId(), b.getId());
        });

        menus.forEach(menu -> {
            if (menu.getChildren() != null) {
                menu.setHasChildren(true);
                sortMenuTree(menu.getChildren());
            }
        });
    }

    private void copyPropertiesToEntity(MenuRequest request, Menu menu) {
        menu.setName(request.getName());
        menu.setCode(request.getCode());
        menu.setPath(request.getPath());
        menu.setIcon(request.getIcon());
        menu.setComponent(request.getComponent());
        menu.setParentId(request.getParentId());
        menu.setSortOrder(request.getSortOrder());
        menu.setMenuType(request.getMenuType());
        menu.setExternal(request.getExternal());
        menu.setCache(request.getCache());
        menu.setHidden(request.getHidden());
        menu.setStatus(request.getStatus());
    }

    private MenuResponse convertToResponse(Menu menu) {
        MenuResponse response = new MenuResponse();
        response.setId(menu.getId());
        response.setName(menu.getName());
        response.setCode(menu.getCode());
        response.setPath(menu.getPath());
        response.setIcon(menu.getIcon());
        response.setComponent(menu.getComponent());
        response.setParentId(menu.getParentId());
        response.setLevel(menu.getLevel());
        response.setSortOrder(menu.getSortOrder());
        response.setMenuType(menu.getMenuType());
        response.setExternal(menu.getExternal());
        response.setCache(menu.getCache());
        response.setHidden(menu.getHidden());
        response.setStatus(menu.getStatus());
        response.setCreatedTime(menu.getCreatedTime());
        response.setUpdatedTime(menu.getUpdatedTime());
        response.setCreatedBy(menu.getCreatedBy());
        response.setUpdatedBy(menu.getUpdatedBy());
        response.setHasChildren(menuRepository.hasActiveChildren(menu.getId()));
        response.setIsRoot(menu.isRoot());

        // Set parent name using SQL query
        if (menu.getParentId() != null) {
            menuRepository.findById(menu.getParentId())
                .ifPresent(parent -> response.setParentName(parent.getName()));
        }

        // Set permission codes using SQL query
        List<String> permissionCodes = menuRepository.findPermissionCodesByMenuId(menu.getId());
        response.setPermissionCodes(new HashSet<>(permissionCodes));

        // Set permission details
        List<Long> permissionIds = menuRepository.findPermissionIdsByMenuId(menu.getId());
        if (!permissionIds.isEmpty()) {
            List<Permission> permissions = permissionRepository.findAllById(permissionIds);
            List<PermissionResponse> permissionResponses = permissions.stream()
                    .map(this::convertPermissionToResponse)
                    .collect(Collectors.toList());
            response.setPermissions(permissionResponses);
        }

        return response;
    }

    private MenuTreeResponse convertToTreeResponse(Menu menu) {
        MenuTreeResponse response = new MenuTreeResponse();
        response.setId(menu.getId());
        response.setName(menu.getName());
        response.setCode(menu.getCode());
        response.setPath(menu.getPath());
        response.setIcon(menu.getIcon());
        response.setComponent(menu.getComponent());
        response.setParentId(menu.getParentId());
        response.setLevel(menu.getLevel());
        response.setSortOrder(menu.getSortOrder());
        response.setMenuType(menu.getMenuType());
        response.setExternal(menu.getExternal());
        response.setCache(menu.getCache());
        response.setHidden(menu.getHidden());
        response.setHasChildren(menuRepository.hasActiveChildren(menu.getId()));

        // Set meta information for frontend
        MenuTreeResponse.MenuMeta meta = new MenuTreeResponse.MenuMeta();
        meta.setTitle(menu.getName());
        meta.setIcon(menu.getIcon());
        meta.setHideInMenu(menu.getHidden());
        meta.setKeepAlive(menu.getCache());
        meta.setTarget(menu.getExternal() ? "_blank" : null);
        meta.setOrder(menu.getSortOrder());
        response.setMeta(meta);

        return response;
    }

    @Override
    @Transactional
    public void addPermissionsToMenu(Long menuId, List<Long> permissionIds, Long operatorId) {
        if (menuId == null || permissionIds == null || permissionIds.isEmpty()) {
            throw new IllegalArgumentException("Menu ID and permission IDs cannot be null or empty");
        }

        // Verify menu exists
        Menu menu = menuRepository.findById(menuId)
                .orElseThrow(() -> new RuntimeException("Menu not found with id: " + menuId));

        // Verify permissions exist and are active
        List<Permission> permissions = permissionRepository.findAllById(permissionIds);
        if (permissions.size() != permissionIds.size()) {
            throw new RuntimeException("Some permissions not found or inactive");
        }

        // Get existing permissions to avoid duplicates
        List<Long> existingPermissionIds = menuRepository.findPermissionIdsByMenuId(menuId);
        List<Long> newPermissionIds = permissionIds.stream()
                .filter(id -> !existingPermissionIds.contains(id))
                .collect(Collectors.toList());

        if (!newPermissionIds.isEmpty()) {
            menuRepository.batchInsertMenuPermissions(menuId, newPermissionIds, operatorId);
            log.info("Added {} permissions to menu {}", newPermissionIds.size(), menuId);
        }
    }

    @Override
    @Transactional
    public void removePermissionsFromMenu(Long menuId, List<Long> permissionIds, Long operatorId) {
        if (menuId == null || permissionIds == null || permissionIds.isEmpty()) {
            throw new IllegalArgumentException("Menu ID and permission IDs cannot be null or empty");
        }

        // Verify menu exists
        Menu menu = menuRepository.findById(menuId)
                .orElseThrow(() -> new RuntimeException("Menu not found with id: " + menuId));

        menuRepository.deleteMenuPermissions(menuId, permissionIds);
        log.info("Removed {} permissions from menu {}", permissionIds.size(), menuId);
    }

    @Override
    @Transactional
    public void updateMenuPermissions(Long menuId, List<Long> permissionIds, Long operatorId) {
        if (menuId == null) {
            throw new IllegalArgumentException("Menu ID cannot be null");
        }

        // Verify menu exists
        Menu menu = menuRepository.findById(menuId)
                .orElseThrow(() -> new RuntimeException("Menu not found with id: " + menuId));

        // Remove all existing permissions
        menuRepository.deleteMenuPermissionsByMenuId(menuId);
        log.info("Cleared all permissions for menu {}", menuId);

        // Add new permissions if provided
        if (permissionIds != null && !permissionIds.isEmpty()) {
            // Verify permissions exist and are active
            List<Permission> permissions = permissionRepository.findAllById(permissionIds);
            if (permissions.size() != permissionIds.size()) {
                throw new RuntimeException("Some permissions not found or inactive");
            }

            menuRepository.batchInsertMenuPermissions(menuId, permissionIds, operatorId);
            log.info("Updated menu {} with {} permissions", menuId, permissionIds.size());
        }
    }

    @Override
    public List<PermissionResponse> getMenuPermissions(Long menuId) {
        if (menuId == null) {
            throw new IllegalArgumentException("Menu ID cannot be null");
        }

        // Verify menu exists
        Menu menu = menuRepository.findById(menuId)
                .orElseThrow(() -> new RuntimeException("Menu not found with id: " + menuId));

        List<Long> permissionIds = menuRepository.findPermissionIdsByMenuId(menuId);
        if (permissionIds.isEmpty()) {
            return new ArrayList<>();
        }

        List<Permission> permissions = permissionRepository.findAllById(permissionIds);
        return permissions.stream()
                .map(this::convertPermissionToResponse)
                .collect(Collectors.toList());
    }

    private PermissionResponse convertPermissionToResponse(Permission permission) {
        PermissionResponse response = new PermissionResponse();
        response.setId(permission.getId());
        response.setName(permission.getName());
        response.setCode(permission.getCode());
        response.setResource(permission.getResource());
        response.setAction(permission.getAction());
        response.setDescription(permission.getDescription());
        response.setStatus(permission.getStatus());
        response.setCreatedTime(permission.getCreatedTime());
        response.setUpdatedTime(permission.getUpdatedTime());
        response.setCreatedBy(permission.getCreatedBy());
        response.setUpdatedBy(permission.getUpdatedBy());
        return response;
    }
}
