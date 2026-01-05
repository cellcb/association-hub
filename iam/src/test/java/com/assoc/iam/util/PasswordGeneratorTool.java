package com.assoc.iam.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Scanner;

/**
 * 密码生成工具
 * 
 * 这是一个独立的工具类，用于：
 * 1. 交互式生成加密密码
 * 2. 批量生成常用密码的加密结果
 * 3. 验证已有的加密密码
 * 
 * 使用方式：
 * 1. 直接运行main方法
 * 2. 在IDE中作为Java Application运行
 * 3. 在测试环境中调用相关方法
 * 
 * @author Water Platform Team
 */
public class PasswordGeneratorTool {

    private static final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public static void main(String[] args) {
        System.out.println("=== 水务平台密码工具 ===");
        System.out.println("请选择功能:");
        System.out.println("1. 交互式密码加密");
        System.out.println("2. 批量生成常用密码");
        System.out.println("3. 验证密码");
        System.out.println("4. 生成初始化SQL");
        System.out.println("5. 退出");
        
        Scanner scanner = new Scanner(System.in);
        
        while (true) {
            System.out.print("\n请输入选项 (1-5): ");
            String choice = scanner.nextLine().trim();
            
            switch (choice) {
                case "1":
                    interactivePasswordGeneration(scanner);
                    break;
                case "2":
                    generateCommonPasswords();
                    break;
                case "3":
                    verifyPassword(scanner);
                    break;
                case "4":
                    generateInitializationSQL();
                    break;
                case "5":
                    System.out.println("再见!");
                    return;
                default:
                    System.out.println("无效选项，请重新选择。");
            }
        }
    }

    /**
     * 交互式密码生成
     */
    private static void interactivePasswordGeneration(Scanner scanner) {
        System.out.println("\n=== 交互式密码加密 ===");
        
        while (true) {
            System.out.print("请输入要加密的密码 (输入 'back' 返回主菜单): ");
            String password = scanner.nextLine();
            
            if ("back".equalsIgnoreCase(password.trim())) {
                break;
            }
            
            if (password.trim().isEmpty()) {
                System.out.println("密码不能为空，请重新输入。");
                continue;
            }
            
            try {
                long startTime = System.currentTimeMillis();
                String encoded = passwordEncoder.encode(password);
                long endTime = System.currentTimeMillis();
                
                System.out.println("\n--- 加密结果 ---");
                System.out.println("原密码: " + password);
                System.out.println("加密后: " + encoded);
                System.out.println("加密用时: " + (endTime - startTime) + "ms");
                System.out.println("密码长度: " + encoded.length() + " 字符");
                
                // 验证加密结果
                boolean verification = passwordEncoder.matches(password, encoded);
                System.out.println("验证结果: " + (verification ? "✓ 成功" : "✗ 失败"));
                
                // 密码强度分析
                if (PasswordUtil.class != null) {
                    try {
                        PasswordUtil.PasswordStrength strength = PasswordUtil.checkPasswordStrength(password);
                        System.out.println("密码强度: " + strength.getDescription());
                    } catch (Exception e) {
                        // 如果PasswordUtil不可用，跳过强度检查
                    }
                }
                
                System.out.println("----------------\n");
                
            } catch (Exception e) {
                System.out.println("加密失败: " + e.getMessage());
            }
        }
    }

    /**
     * 生成常用密码的加密结果
     */
    private static void generateCommonPasswords() {
        System.out.println("\n=== 批量生成常用密码 ===");
        
        String[][] passwordGroups = {
            {"管理员密码", "123456", "administrator", "root123", "super123"},
            {"用户密码", "user123", "test123", "demo123", "guest123"},
            {"开发密码", "dev123", "debug123", "local123", "staging123"},
            {"默认密码", "password123", "123456789", "welcome123", "changeme"}
        };
        
        for (String[] group : passwordGroups) {
            System.out.println("\n--- " + group[0] + " ---");
            
            for (int i = 1; i < group.length; i++) {
                String password = group[i];
                String encoded = passwordEncoder.encode(password);
                
                System.out.println("密码: " + password);
                System.out.println("加密: " + encoded);
                System.out.println();
            }
        }
        
        System.out.println("批量生成完成！");
    }

    /**
     * 验证密码
     */
    private static void verifyPassword(Scanner scanner) {
        System.out.println("\n=== 密码验证 ===");
        
        while (true) {
            System.out.print("请输入原始密码 (输入 'back' 返回): ");
            String rawPassword = scanner.nextLine();
            
            if ("back".equalsIgnoreCase(rawPassword.trim())) {
                break;
            }
            
            System.out.print("请输入加密后的密码: ");
            String hashedPassword = scanner.nextLine();
            
            if (rawPassword.trim().isEmpty() || hashedPassword.trim().isEmpty()) {
                System.out.println("密码不能为空，请重新输入。");
                continue;
            }
            
            try {
                long startTime = System.currentTimeMillis();
                boolean matches = passwordEncoder.matches(rawPassword, hashedPassword);
                long endTime = System.currentTimeMillis();
                
                System.out.println("\n--- 验证结果 ---");
                System.out.println("原始密码: " + rawPassword);
                System.out.println("加密密码: " + hashedPassword);
                System.out.println("验证结果: " + (matches ? "✓ 匹配" : "✗ 不匹配"));
                System.out.println("验证用时: " + (endTime - startTime) + "ms");
                System.out.println("----------------\n");
                
            } catch (Exception e) {
                System.out.println("验证失败: " + e.getMessage());
            }
        }
    }

    /**
     * 生成数据库初始化SQL
     */
    private static void generateInitializationSQL() {
        System.out.println("\n=== 生成初始化SQL ===");
        
        // 定义用户数据
        String[][] users = {
            {"admin", "123456", "系统管理员", "admin@waterplatform.com"},
            {"operator", "operator123", "操作员", "operator@waterplatform.com"},
            {"viewer", "viewer123", "查看者", "viewer@waterplatform.com"},
            {"guest", "guest123", "访客", "guest@waterplatform.com"}
        };
        
        System.out.println("-- 水务平台用户初始化SQL");
        System.out.println("-- 生成时间: " + new java.util.Date());
        System.out.println();
        
        for (String[] user : users) {
            String username = user[0];
            String password = user[1];
            String displayName = user[2];
            String email = user[3];
            String encodedPassword = passwordEncoder.encode(password);
            
            System.out.println("-- 用户: " + displayName + " (密码: " + password + ")");
            System.out.println("INSERT INTO users (username, password, email, display_name, status, created_at, updated_at)");
            System.out.println("VALUES (");
            System.out.println("    '" + username + "',");
            System.out.println("    '" + encodedPassword + "',");
            System.out.println("    '" + email + "',");
            System.out.println("    '" + displayName + "',");
            System.out.println("    1,");
            System.out.println("    NOW(),");
            System.out.println("    NOW()");
            System.out.println(");");
            System.out.println();
        }
        
        System.out.println("-- SQL生成完成");
        System.out.println("-- 注意：请在生产环境中修改默认密码！");
    }

    /**
     * 静态工具方法 - 直接生成加密密码
     */
    public static String encodePassword(String rawPassword) {
        return passwordEncoder.encode(rawPassword);
    }

    /**
     * 静态工具方法 - 验证密码
     */
    public static boolean verifyPassword(String rawPassword, String encodedPassword) {
        return passwordEncoder.matches(rawPassword, encodedPassword);
    }

    /**
     * 批量生成密码并返回结果
     */
    public static java.util.Map<String, String> batchEncodePasswords(String... passwords) {
        java.util.Map<String, String> result = new java.util.LinkedHashMap<>();
        
        for (String password : passwords) {
            result.put(password, passwordEncoder.encode(password));
        }
        
        return result;
    }

    /**
     * 生成指定数量的同一密码加密结果（用于测试盐值随机性）
     */
    public static void demonstrateSaltRandomness(String password, int count) {
        System.out.println("=== 盐值随机性演示 ===");
        System.out.println("密码: " + password);
        System.out.println("生成 " + count + " 个不同的加密结果:\n");
        
        for (int i = 1; i <= count; i++) {
            String encoded = passwordEncoder.encode(password);
            boolean verified = passwordEncoder.matches(password, encoded);
            
            System.out.println(i + ". " + encoded + " (验证: " + (verified ? "✓" : "✗") + ")");
        }
        
        System.out.println("\n注意：尽管密码相同，但每次生成的加密结果都不同（因为盐值不同）");
    }

    /**
     * 性能测试
     */
    public static void performanceTest(String password, int iterations) {
        System.out.println("=== 性能测试 ===");
        System.out.println("密码: " + password);
        System.out.println("测试次数: " + iterations);
        
        // 加密性能测试
        long startTime = System.currentTimeMillis();
        for (int i = 0; i < iterations; i++) {
            passwordEncoder.encode(password);
        }
        long encodeTime = System.currentTimeMillis() - startTime;
        
        // 验证性能测试
        String encoded = passwordEncoder.encode(password);
        startTime = System.currentTimeMillis();
        for (int i = 0; i < iterations; i++) {
            passwordEncoder.matches(password, encoded);
        }
        long verifyTime = System.currentTimeMillis() - startTime;
        
        System.out.println("\n结果:");
        System.out.println("加密总时间: " + encodeTime + "ms");
        System.out.println("平均加密时间: " + (encodeTime / iterations) + "ms");
        System.out.println("验证总时间: " + verifyTime + "ms");
        System.out.println("平均验证时间: " + (verifyTime / iterations) + "ms");
        
        // 性能建议
        double avgEncodeTime = (double) encodeTime / iterations;
        if (avgEncodeTime > 100) {
            System.out.println("\n⚠️  加密时间较长，考虑在异步环境中处理密码加密");
        } else if (avgEncodeTime < 10) {
            System.out.println("\n⚠️  加密时间过短，可能需要增加BCrypt强度以提高安全性");
        } else {
            System.out.println("\n✓ 加密性能适中，安全性和性能平衡良好");
        }
    }
}
