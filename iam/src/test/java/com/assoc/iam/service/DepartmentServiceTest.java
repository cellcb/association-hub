package com.assoc.iam.service;

import com.assoc.iam.dto.DepartmentRequest;
import com.assoc.iam.dto.DepartmentResponse;
import com.assoc.iam.dto.DepartmentTreeResponse;
import com.assoc.iam.entity.Department;
import com.assoc.iam.repository.DepartmentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DepartmentServiceTest {

    @Mock
    private DepartmentRepository departmentRepository;

    @InjectMocks
    private DepartmentService departmentService;

    private Department rootDepartment;
    private Department childDepartment;
    private DepartmentRequest departmentRequest;

    @BeforeEach
    void setUp() {
        rootDepartment = new Department();
        rootDepartment.setId(1L);
        rootDepartment.setName("技术部");
        rootDepartment.setCode("TECH");
        rootDepartment.setDescription("技术开发部门");
        rootDepartment.setParentId(null);
        rootDepartment.setLevel(1);
        rootDepartment.setPath("1");
        rootDepartment.setSortOrder(1);
        rootDepartment.setStatus(1);
        rootDepartment.setCreatedTime(LocalDateTime.now());
        rootDepartment.setUpdatedTime(LocalDateTime.now());

        childDepartment = new Department();
        childDepartment.setId(2L);
        childDepartment.setName("开发组");
        childDepartment.setCode("DEV_TEAM");
        childDepartment.setDescription("软件开发组");
        childDepartment.setParentId(1L);
        childDepartment.setLevel(2);
        childDepartment.setPath("1/2");
        childDepartment.setSortOrder(1);
        childDepartment.setStatus(1);
        childDepartment.setCreatedTime(LocalDateTime.now());
        childDepartment.setUpdatedTime(LocalDateTime.now());

        departmentRequest = new DepartmentRequest();
        departmentRequest.setName("测试部门");
        departmentRequest.setCode("TEST_DEPT");
        departmentRequest.setDescription("测试用部门");
        departmentRequest.setParentId(1L);
        departmentRequest.setSortOrder(1);
        departmentRequest.setStatus(1);
    }

    @Test
    void getDepartmentTree_ShouldReturnTreeStructure() {
        // Given
        rootDepartment.setChildren(Arrays.asList(childDepartment));
        when(departmentRepository.findActiveRootDepartments()).thenReturn(Arrays.asList(rootDepartment));

        // When
        List<DepartmentTreeResponse> result = departmentService.getDepartmentTree();

        // Then
        assertThat(result).hasSize(1);
        DepartmentTreeResponse treeResponse = result.get(0);
        assertThat(treeResponse.getId()).isEqualTo(1L);
        assertThat(treeResponse.getName()).isEqualTo("技术部");
        assertThat(treeResponse.getCode()).isEqualTo("TECH");
        assertThat(treeResponse.isHasChildren()).isTrue();
    }

    @Test
    void getAllDepartments_ShouldReturnAllActiveDepartments() {
        // Given
        when(departmentRepository.findByStatusOrderBySortOrderAsc(1)).thenReturn(Arrays.asList(rootDepartment, childDepartment));

        // When
        List<DepartmentResponse> result = departmentService.getAllDepartments();

        // Then
        assertThat(result).hasSize(2);
        assertThat(result.get(0).getName()).isEqualTo("技术部");
        assertThat(result.get(1).getName()).isEqualTo("开发组");
    }

    @Test
    void getDepartmentById_ShouldReturnDepartment_WhenExists() {
        // Given
        when(departmentRepository.findById(1L)).thenReturn(Optional.of(rootDepartment));

        // When
        Optional<DepartmentResponse> result = departmentService.getDepartmentById(1L);

        // Then
        assertThat(result).isPresent();
        assertThat(result.get().getId()).isEqualTo(1L);
        assertThat(result.get().getName()).isEqualTo("技术部");
    }

    @Test
    void getDepartmentById_ShouldReturnEmpty_WhenNotExists() {
        // Given
        when(departmentRepository.findById(999L)).thenReturn(Optional.empty());

        // When
        Optional<DepartmentResponse> result = departmentService.getDepartmentById(999L);

        // Then
        assertThat(result).isEmpty();
    }

    @Test
    void getDepartmentByCode_ShouldReturnDepartment_WhenExists() {
        // Given
        when(departmentRepository.findByCode("TECH")).thenReturn(Optional.of(rootDepartment));

        // When
        Optional<DepartmentResponse> result = departmentService.getDepartmentByCode("TECH");

        // Then
        assertThat(result).isPresent();
        assertThat(result.get().getCode()).isEqualTo("TECH");
    }

    @Test
    void getChildrenByParentId_ShouldReturnChildren() {
        // Given
        when(departmentRepository.findActiveChildrenByParentId(1L)).thenReturn(Arrays.asList(childDepartment));

        // When
        List<DepartmentResponse> result = departmentService.getChildrenByParentId(1L);

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getParentId()).isEqualTo(1L);
        assertThat(result.get(0).getName()).isEqualTo("开发组");
    }

    @Test
    void searchDepartments_ShouldReturnMatchingDepartments() {
        // Given
        when(departmentRepository.findByNameContainingIgnoreCaseAndStatusOrderBySortOrderAsc("技术", 1))
                .thenReturn(Arrays.asList(rootDepartment));

        // When
        List<DepartmentResponse> result = departmentService.searchDepartments("技术");

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("技术部");
    }

    @Test
    void createDepartment_ShouldCreateSuccessfully_WhenValidRequest() {
        // Given
        Department savedDepartment = new Department();
        savedDepartment.setId(3L);
        savedDepartment.setName(departmentRequest.getName());
        savedDepartment.setCode(departmentRequest.getCode());
        savedDepartment.setDescription(departmentRequest.getDescription());
        savedDepartment.setParentId(departmentRequest.getParentId());
        savedDepartment.setLevel(2);
        savedDepartment.setPath("1/3");

        when(departmentRepository.existsByCode(departmentRequest.getCode())).thenReturn(false);
        when(departmentRepository.existsById(1L)).thenReturn(true);
        when(departmentRepository.findById(1L)).thenReturn(Optional.of(rootDepartment));
        when(departmentRepository.save(any(Department.class))).thenReturn(savedDepartment);

        // When
        DepartmentResponse result = departmentService.createDepartment(departmentRequest);

        // Then
        assertThat(result.getId()).isEqualTo(3L);
        assertThat(result.getName()).isEqualTo("测试部门");
        assertThat(result.getCode()).isEqualTo("TEST_DEPT");
        verify(departmentRepository).save(any(Department.class));
    }

    @Test
    void createDepartment_ShouldThrowException_WhenCodeExists() {
        // Given
        when(departmentRepository.existsByCode(departmentRequest.getCode())).thenReturn(true);
        when(departmentRepository.findByCode(departmentRequest.getCode())).thenReturn(Optional.of(rootDepartment));

        // When & Then
        assertThatThrownBy(() -> departmentService.createDepartment(departmentRequest))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("部门编码已存在");
    }

    @Test
    void createDepartment_ShouldThrowException_WhenParentNotExists() {
        // Given
        when(departmentRepository.existsByCode(departmentRequest.getCode())).thenReturn(false);
        when(departmentRepository.existsById(1L)).thenReturn(false);

        // When & Then
        assertThatThrownBy(() -> departmentService.createDepartment(departmentRequest))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("父部门不存在");
    }

    @Test
    void updateDepartment_ShouldUpdateSuccessfully_WhenValidRequest() {
        // Given
        departmentRequest.setName("更新的技术部");
        departmentRequest.setCode("UPDATED_TECH");
        departmentRequest.setParentId(null); // Set parent to null to avoid self-reference
        
        when(departmentRepository.findById(1L)).thenReturn(Optional.of(rootDepartment));
        when(departmentRepository.existsByCode("UPDATED_TECH")).thenReturn(false);
        when(departmentRepository.save(any(Department.class))).thenReturn(rootDepartment);

        // When
        DepartmentResponse result = departmentService.updateDepartment(1L, departmentRequest);

        // Then
        assertThat(result.getId()).isEqualTo(1L);
        verify(departmentRepository).save(any(Department.class));
    }

    @Test
    void updateDepartment_ShouldThrowException_WhenDepartmentNotExists() {
        // Given
        when(departmentRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> departmentService.updateDepartment(999L, departmentRequest))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("部门不存在");
    }

    @Test
    void deleteDepartment_ShouldDeleteSuccessfully_WhenNoDependencies() {
        // Given
        when(departmentRepository.findById(1L)).thenReturn(Optional.of(rootDepartment));
        when(departmentRepository.hasChildren(1L)).thenReturn(false);

        // When
        departmentService.deleteDepartment(1L);

        // Then
        verify(departmentRepository).delete(rootDepartment);
    }

    @Test
    void deleteDepartment_ShouldThrowException_WhenHasChildren() {
        // Given
        when(departmentRepository.findById(1L)).thenReturn(Optional.of(rootDepartment));
        when(departmentRepository.hasChildren(1L)).thenReturn(true);

        // When & Then
        assertThatThrownBy(() -> departmentService.deleteDepartment(1L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("存在子部门，无法删除");
    }

    @Test
    void deleteDepartment_ShouldThrowException_WhenDepartmentNotExists() {
        // Given
        when(departmentRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> departmentService.deleteDepartment(999L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("部门不存在");
    }

    @Test
    void moveDepartment_ShouldMoveSuccessfully_WhenValidMove() {
        // Given
        Department targetParent = new Department();
        targetParent.setId(3L);
        targetParent.setLevel(1);
        targetParent.setPath("3");

        when(departmentRepository.findById(2L)).thenReturn(Optional.of(childDepartment));
        when(departmentRepository.findById(3L)).thenReturn(Optional.of(targetParent));
        when(departmentRepository.findByParentIdOrderBySortOrderAsc(2L)).thenReturn(Arrays.asList());
        when(departmentRepository.save(any(Department.class))).thenReturn(childDepartment);

        // When
        departmentService.moveDepartment(2L, 3L);

        // Then
        verify(departmentRepository).save(any(Department.class));
    }

    @Test
    void moveDepartment_ShouldThrowException_WhenTargetParentNotExists() {
        // Given
        when(departmentRepository.findById(2L)).thenReturn(Optional.of(childDepartment));
        when(departmentRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> departmentService.moveDepartment(2L, 999L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("目标父部门不存在");
    }
}
