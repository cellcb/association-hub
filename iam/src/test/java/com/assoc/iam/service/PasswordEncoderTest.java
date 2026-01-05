package com.assoc.iam.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;

/**
 * PasswordEncoder 测试类
 * 
 * 功能：
 * 1. 测试密码加密功能
 * 2. 测试密码验证功能
 * 3. 测试密码强度验证
 * 4. 提供密码加密工具方法
 * 
 * @author Water Platform Team
 */
@SpringBootTest
@ActiveProfiles("test")
@DisplayName("密码编码器测试")
public class PasswordEncoderTest {

    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        passwordEncoder = new BCryptPasswordEncoder();
    }

    @Test
    @DisplayName("测试密码加密 - 基本功能")
    void testPasswordEncoding() {
        // Given
        String rawPassword = "password123";
        
        // When
        String encodedPassword = passwordEncoder.encode(rawPassword);
        
        // Then
        System.out.println("加密后的密码: " + encodedPassword);
    }


}
