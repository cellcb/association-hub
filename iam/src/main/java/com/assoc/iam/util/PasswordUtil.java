package com.assoc.iam.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.regex.Pattern;

/**
 * 密码工具类
 * 
 * 提供密码加密、验证、强度检查等功能
 * 
 * @author Water Platform Team
 */
@Component
public class PasswordUtil {

    private static final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    
    // 密码规则的正则表达式
    private static final Pattern LOWERCASE = Pattern.compile(".*[a-z].*");
    private static final Pattern UPPERCASE = Pattern.compile(".*[A-Z].*");
    private static final Pattern DIGIT = Pattern.compile(".*[0-9].*");
    private static final Pattern SPECIAL_CHAR = Pattern.compile(".*[!@#$%^&*()_+\\-=\\[\\]{};':\",./<>?].*");

    /**
     * 加密密码
     * 
     * @param rawPassword 原始密码
     * @return 加密后的密码
     * @throws IllegalArgumentException 如果密码为null
     */
    public static String encode(String rawPassword) {
        if (rawPassword == null) {
            throw new IllegalArgumentException("密码不能为空");
        }
        return passwordEncoder.encode(rawPassword);
    }

    /**
     * 验证密码
     * 
     * @param rawPassword 原始密码
     * @param encodedPassword 加密后的密码
     * @return 验证结果
     */
    public static boolean matches(String rawPassword, String encodedPassword) {
        if (rawPassword == null || encodedPassword == null) {
            return false;
        }
        return passwordEncoder.matches(rawPassword, encodedPassword);
    }

    /**
     * 检查密码强度
     * 
     * @param password 密码
     * @return 密码强度等级
     */
    public static PasswordStrength checkPasswordStrength(String password) {
        if (password == null || password.length() < 4) {
            return PasswordStrength.VERY_WEAK;
        }
        
        int score = 0;
        
        // 长度得分
        if (password.length() >= 8) score++;
        if (password.length() >= 12) score++;
        if (password.length() >= 16) score++;
        
        // 字符类型得分
        if (LOWERCASE.matcher(password).matches()) score++;
        if (UPPERCASE.matcher(password).matches()) score++;
        if (DIGIT.matcher(password).matches()) score++;
        if (SPECIAL_CHAR.matcher(password).matches()) score++;
        
        // 额外规则
        if (password.length() >= 20) score++; // 超长密码奖励
        if (!containsCommonPatterns(password)) score++; // 不包含常见模式奖励
        
        return switch (score) {
            case 0, 1, 2 -> PasswordStrength.VERY_WEAK;
            case 3, 4 -> PasswordStrength.WEAK;
            case 5, 6 -> PasswordStrength.MEDIUM;
            case 7, 8 -> PasswordStrength.STRONG;
            default -> PasswordStrength.VERY_STRONG;
        };
    }

    /**
     * 验证密码是否符合安全要求
     * 
     * @param password 密码
     * @return 验证结果
     */
    public static PasswordValidationResult validatePassword(String password) {
        PasswordValidationResult result = new PasswordValidationResult();
        
        if (password == null) {
            result.addError("密码不能为空");
            return result;
        }
        
        // 长度检查
        if (password.length() < 8) {
            result.addError("密码长度至少需要8个字符");
        }
        if (password.length() > 128) {
            result.addError("密码长度不能超过128个字符");
        }
        
        // 字符类型检查
        if (!LOWERCASE.matcher(password).matches()) {
            result.addWarning("建议包含小写字母");
        }
        if (!UPPERCASE.matcher(password).matches()) {
            result.addWarning("建议包含大写字母");
        }
        if (!DIGIT.matcher(password).matches()) {
            result.addWarning("建议包含数字");
        }
        if (!SPECIAL_CHAR.matcher(password).matches()) {
            result.addWarning("建议包含特殊字符");
        }
        
        // 常见模式检查
        if (containsCommonPatterns(password)) {
            result.addWarning("密码包含常见模式，建议使用更复杂的组合");
        }
        
        // 设置强度
        result.setStrength(checkPasswordStrength(password));
        
        return result;
    }

    /**
     * 检查是否包含常见的不安全模式
     */
    private static boolean containsCommonPatterns(String password) {
        String lowerPassword = password.toLowerCase();
        
        // 常见弱密码模式
        String[] commonPatterns = {
            "123456", "password", "admin", "user", "guest",
            "qwerty", "abc", "111111", "000000", "root",
            "test", "demo", "login", "welcome"
        };
        
        for (String pattern : commonPatterns) {
            if (lowerPassword.contains(pattern)) {
                return true;
            }
        }
        
        // 检查简单的数字序列
        if (lowerPassword.matches(".*123.*") || 
            lowerPassword.matches(".*abc.*") ||
            lowerPassword.matches(".*000.*") ||
            lowerPassword.matches(".*111.*")) {
            return true;
        }
        
        return false;
    }

    /**
     * 生成密码强度报告
     * 
     * @param password 密码
     * @return 强度报告
     */
    public static String generateStrengthReport(String password) {
        if (password == null) {
            return "密码为空";
        }
        
        StringBuilder report = new StringBuilder();
        PasswordStrength strength = checkPasswordStrength(password);
        
        report.append("密码强度: ").append(strength.getDescription()).append("\n");
        report.append("密码长度: ").append(password.length()).append(" 字符\n");
        
        // 详细分析
        report.append("包含小写字母: ").append(LOWERCASE.matcher(password).matches() ? "✓" : "✗").append("\n");
        report.append("包含大写字母: ").append(UPPERCASE.matcher(password).matches() ? "✓" : "✗").append("\n");
        report.append("包含数字: ").append(DIGIT.matcher(password).matches() ? "✓" : "✗").append("\n");
        report.append("包含特殊字符: ").append(SPECIAL_CHAR.matcher(password).matches() ? "✓" : "✗").append("\n");
        report.append("避免常见模式: ").append(!containsCommonPatterns(password) ? "✓" : "✗").append("\n");
        
        // 建议
        PasswordValidationResult validation = validatePassword(password);
        if (!validation.getWarnings().isEmpty()) {
            report.append("\n建议:\n");
            for (String warning : validation.getWarnings()) {
                report.append("- ").append(warning).append("\n");
            }
        }
        
        return report.toString();
    }

    /**
     * 密码强度枚举
     */
    public enum PasswordStrength {
        VERY_WEAK("极弱", 1),
        WEAK("弱", 2),
        MEDIUM("中等", 3),
        STRONG("强", 4),
        VERY_STRONG("极强", 5);

        private final String description;
        private final int level;

        PasswordStrength(String description, int level) {
            this.description = description;
            this.level = level;
        }

        public String getDescription() {
            return description;
        }

        public int getLevel() {
            return level;
        }
    }

    /**
     * 密码验证结果类
     */
    public static class PasswordValidationResult {
        private final java.util.List<String> errors = new java.util.ArrayList<>();
        private final java.util.List<String> warnings = new java.util.ArrayList<>();
        private PasswordStrength strength;

        public void addError(String error) {
            errors.add(error);
        }

        public void addWarning(String warning) {
            warnings.add(warning);
        }

        public java.util.List<String> getErrors() {
            return errors;
        }

        public java.util.List<String> getWarnings() {
            return warnings;
        }

        public boolean isValid() {
            return errors.isEmpty();
        }

        public PasswordStrength getStrength() {
            return strength;
        }

        public void setStrength(PasswordStrength strength) {
            this.strength = strength;
        }

        @Override
        public String toString() {
            StringBuilder sb = new StringBuilder();
            sb.append("验证结果: ").append(isValid() ? "通过" : "失败").append("\n");
            
            if (!errors.isEmpty()) {
                sb.append("错误:\n");
                for (String error : errors) {
                    sb.append("- ").append(error).append("\n");
                }
            }
            
            if (!warnings.isEmpty()) {
                sb.append("警告:\n");
                for (String warning : warnings) {
                    sb.append("- ").append(warning).append("\n");
                }
            }
            
            if (strength != null) {
                sb.append("密码强度: ").append(strength.getDescription()).append("\n");
            }
            
            return sb.toString();
        }
    }

    /**
     * 主方法 - 用于命令行测试
     */
    public static void main(String[] args) {
        // 测试用例
        String[] testPasswords = {
            "123456",
            "123456",
            "123456!",
            "SuperStrongPassword!@#123",
            "极强密码Test123!@#"
        };

        System.out.println("=== 密码工具测试 ===\n");

        for (String password : testPasswords) {
            System.out.println("测试密码: " + password);
            System.out.println("加密结果: " + encode(password));
            System.out.println("强度报告:\n" + generateStrengthReport(password));
            System.out.println("验证结果:\n" + validatePassword(password));
            System.out.println("----------------------------------------\n");
        }
    }
}
