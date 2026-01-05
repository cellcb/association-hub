package com.assoc.iam.service;

import com.assoc.iam.dto.UserDepartmentRequest;
import com.assoc.iam.dto.UserDepartmentResponse;
import com.assoc.iam.entity.Department;
import com.assoc.iam.entity.User;
import com.assoc.iam.entity.UserDepartment;
import com.assoc.iam.exception.UserNotFoundException;
import com.assoc.iam.repository.DepartmentRepository;
import com.assoc.iam.repository.UserDepartmentRepository;
import com.assoc.iam.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserDepartmentServiceTest {
    
    @Mock
    private UserDepartmentRepository userDepartmentRepository;
    
    @Mock
    private UserRepository userRepository;
    
    @Mock
    private DepartmentRepository departmentRepository;
    
    @InjectMocks
    private UserDepartmentServiceImpl userDepartmentService;
    
    private User testUser;
    private Department testDepartment;
    private UserDepartment testUserDepartment;
    
    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        testUser.setRealName("Test User");
        
        testDepartment = new Department();
        testDepartment.setId(1L);
        testDepartment.setName("Test Department");
        testDepartment.setCode("TEST_DEPT");
        
        testUserDepartment = new UserDepartment();
        testUserDepartment.setId(1L);
        testUserDepartment.setUserId(1L);
        testUserDepartment.setDepartmentId(1L);
        testUserDepartment.setPosition("软件工程师");
        testUserDepartment.setIsPrimary(true);
        testUserDepartment.setStatus(1);
        testUserDepartment.setStartDate(LocalDate.now().minusDays(30));
        testUserDepartment.setCreatedTime(LocalDateTime.now());
        testUserDepartment.setUpdatedTime(LocalDateTime.now());
    }
    
    @Test
    void createUserDepartment_Success() {
        // Given
        UserDepartmentRequest request = new UserDepartmentRequest();
        request.setUserId(1L);
        request.setDepartmentId(1L);
        request.setPosition("软件工程师");
        request.setIsPrimary(true);
        request.setStatus(1);
        request.setStartDate(LocalDate.now());
        
        when(userRepository.existsById(1L)).thenReturn(true);
        when(departmentRepository.existsById(1L)).thenReturn(true);
        when(userDepartmentRepository.existsActiveRelationship(anyLong(), anyLong(), any(LocalDate.class)))
                .thenReturn(false);
        when(userDepartmentRepository.save(any(UserDepartment.class))).thenReturn(testUserDepartment);
        
        // When
        UserDepartmentResponse response = userDepartmentService.createUserDepartment(request);
        
        // Then
        assertThat(response).isNotNull();
        assertThat(response.getUserId()).isEqualTo(1L);
        assertThat(response.getDepartmentId()).isEqualTo(1L);
        assertThat(response.getPosition()).isEqualTo("软件工程师");
        assertThat(response.getIsPrimary()).isTrue();
        
        verify(userDepartmentRepository).clearUserPrimaryFlag(1L);
        verify(userDepartmentRepository).save(any(UserDepartment.class));
    }
    
    @Test
    void createUserDepartment_UserNotFound() {
        // Given
        UserDepartmentRequest request = new UserDepartmentRequest();
        request.setUserId(999L);
        request.setDepartmentId(1L);
        
        when(userRepository.existsById(999L)).thenReturn(false);
        
        // When & Then
        assertThatThrownBy(() -> userDepartmentService.createUserDepartment(request))
                .isInstanceOf(UserNotFoundException.class)
                .hasMessageContaining("用户不存在");
    }
    
    @Test
    void createUserDepartment_DepartmentNotFound() {
        // Given
        UserDepartmentRequest request = new UserDepartmentRequest();
        request.setUserId(1L);
        request.setDepartmentId(999L);
        
        when(userRepository.existsById(1L)).thenReturn(true);
        when(departmentRepository.existsById(999L)).thenReturn(false);
        
        // When & Then
        assertThatThrownBy(() -> userDepartmentService.createUserDepartment(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("部门不存在");
    }
    
    @Test
    void createUserDepartment_RelationshipAlreadyExists() {
        // Given
        UserDepartmentRequest request = new UserDepartmentRequest();
        request.setUserId(1L);
        request.setDepartmentId(1L);
        
        when(userRepository.existsById(1L)).thenReturn(true);
        when(departmentRepository.existsById(1L)).thenReturn(true);
        when(userDepartmentRepository.existsActiveRelationship(anyLong(), anyLong(), any(LocalDate.class)))
                .thenReturn(true);
        
        // When & Then
        assertThatThrownBy(() -> userDepartmentService.createUserDepartment(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("用户与部门的关系已存在");
    }
    
    @Test
    void getActiveUserDepartmentsByUserId_Success() {
        // Given
        List<UserDepartment> userDepartments = List.of(testUserDepartment);
        when(userDepartmentRepository.findActiveByUserId(eq(1L), any(LocalDate.class)))
                .thenReturn(userDepartments);
        
        // When
        List<UserDepartmentResponse> responses = userDepartmentService.getActiveUserDepartmentsByUserId(1L);
        
        // Then
        assertThat(responses).hasSize(1);
        assertThat(responses.get(0).getUserId()).isEqualTo(1L);
        assertThat(responses.get(0).getDepartmentId()).isEqualTo(1L);
        assertThat(responses.get(0).getIsPrimary()).isTrue();
    }
    
    @Test
    void getUserPrimaryDepartment_Success() {
        // Given
        when(userDepartmentRepository.findPrimaryByUserId(eq(1L), any(LocalDate.class)))
                .thenReturn(Optional.of(testUserDepartment));
        
        // When
        UserDepartmentResponse response = userDepartmentService.getUserPrimaryDepartment(1L);
        
        // Then
        assertThat(response).isNotNull();
        assertThat(response.getIsPrimary()).isTrue();
        assertThat(response.getUserId()).isEqualTo(1L);
    }
    
    @Test
    void getUserPrimaryDepartment_NotFound() {
        // Given
        when(userDepartmentRepository.findPrimaryByUserId(eq(1L), any(LocalDate.class)))
                .thenReturn(Optional.empty());
        
        // When
        UserDepartmentResponse response = userDepartmentService.getUserPrimaryDepartment(1L);
        
        // Then
        assertThat(response).isNull();
    }
    
    @Test
    void setUserPrimaryDepartment_Success() {
        // Given
        when(userRepository.existsById(1L)).thenReturn(true);
        when(departmentRepository.existsById(1L)).thenReturn(true);
        when(userDepartmentRepository.existsActiveRelationship(anyLong(), anyLong(), any(LocalDate.class)))
                .thenReturn(true);
        when(userDepartmentRepository.setUserPrimaryDepartment(1L, 1L)).thenReturn(1);
        when(userDepartmentRepository.findPrimaryByUserId(eq(1L), any(LocalDate.class)))
                .thenReturn(Optional.of(testUserDepartment));
        
        // When
        UserDepartmentResponse response = userDepartmentService.setUserPrimaryDepartment(1L, 1L);
        
        // Then
        assertThat(response).isNotNull();
        assertThat(response.getIsPrimary()).isTrue();
        
        verify(userDepartmentRepository).clearUserPrimaryFlag(1L);
        verify(userDepartmentRepository).setUserPrimaryDepartment(1L, 1L);
    }
    
    @Test
    void setUserPrimaryDepartment_RelationshipNotExists() {
        // Given
        when(userRepository.existsById(1L)).thenReturn(true);
        when(departmentRepository.existsById(1L)).thenReturn(true);
        when(userDepartmentRepository.existsActiveRelationship(anyLong(), anyLong(), any(LocalDate.class)))
                .thenReturn(false);
        
        // When & Then
        assertThatThrownBy(() -> userDepartmentService.setUserPrimaryDepartment(1L, 1L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("用户与部门的关系不存在或未激活");
    }
    
    @Test
    void removeUserFromDepartment_Success() {
        // Given
        when(userDepartmentRepository.deactivateRelationship(anyLong(), anyLong(), any(LocalDate.class), any()))
                .thenReturn(1);
        
        // When & Then
        assertThatCode(() -> userDepartmentService.removeUserFromDepartment(1L, 1L))
                .doesNotThrowAnyException();
        
        verify(userDepartmentRepository).deactivateRelationship(eq(1L), eq(1L), any(LocalDate.class), isNull());
    }
    
    @Test
    void removeUserFromDepartment_NotFound() {
        // Given
        when(userDepartmentRepository.deactivateRelationship(anyLong(), anyLong(), any(LocalDate.class), any()))
                .thenReturn(0);
        
        // When & Then
        assertThatThrownBy(() -> userDepartmentService.removeUserFromDepartment(1L, 1L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("用户部门关系不存在或已失效");
    }
    
    @Test
    void getDepartmentUserCount_Success() {
        // Given
        when(userDepartmentRepository.countActiveUsersByDepartmentId(eq(1L), any(LocalDate.class)))
                .thenReturn(5L);
        
        // When
        long count = userDepartmentService.getDepartmentUserCount(1L);
        
        // Then
        assertThat(count).isEqualTo(5L);
    }
    
    @Test
    void isUserInDepartment_True() {
        // Given
        when(userDepartmentRepository.existsActiveRelationship(eq(1L), eq(1L), any(LocalDate.class)))
                .thenReturn(true);
        
        // When
        boolean result = userDepartmentService.isUserInDepartment(1L, 1L);
        
        // Then
        assertThat(result).isTrue();
    }
    
    @Test
    void isUserInDepartment_False() {
        // Given
        when(userDepartmentRepository.existsActiveRelationship(eq(1L), eq(1L), any(LocalDate.class)))
                .thenReturn(false);
        
        // When
        boolean result = userDepartmentService.isUserInDepartment(1L, 1L);
        
        // Then
        assertThat(result).isFalse();
    }
    
    @Test
    void processExpiredRelationships_Success() {
        // Given
        UserDepartment expiredRelationship = new UserDepartment();
        expiredRelationship.setId(2L);
        expiredRelationship.setUserId(1L);
        expiredRelationship.setDepartmentId(1L);
        expiredRelationship.setStatus(1);
        expiredRelationship.setEndDate(LocalDate.now().minusDays(1));
        
        when(userDepartmentRepository.findExpiredRelationships(any(LocalDate.class)))
                .thenReturn(List.of(expiredRelationship));
        
        // When
        int count = userDepartmentService.processExpiredRelationships();
        
        // Then
        assertThat(count).isEqualTo(1);
        assertThat(expiredRelationship.getStatus()).isEqualTo(0);
        
        verify(userDepartmentRepository).saveAll(anyList());
    }
}
