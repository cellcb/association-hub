import type { PasswordStrengthLevel, PasswordStrengthInfo, ChangePasswordRequest } from '@/types/auth';

/**
 * 常见弱密码模式列表
 */
const COMMON_PATTERNS = [
    '123456',
    'password',
    'admin',
    'user',
    'guest',
    'qwerty',
    'abc',
    '111111',
    '000000',
    'login',
    '123',
    'pass',
];

/**
 * 计算密码强度分数（简化版，降低复杂度要求）
 * @param password 密码字符串
 * @returns 强度分数 (0-10+)
 */
export function calculatePasswordStrength(password: string): number {
    if (!password) return 0;

    let score = 0;

    // 长度评分（降低门槛，6位就给分）
    if (password.length >= 6) score += 2;  // 6位给2分
    if (password.length >= 8) score++;     // 8位再加1分
    if (password.length >= 12) score++;    // 12位再加1分
    if (password.length >= 16) score++;    // 16位再加1分

    // 字符类型评分（有就加分，不强制）
    if (/[a-z]/.test(password)) score++; // 包含小写字母
    if (/[A-Z]/.test(password)) score++; // 包含大写字母
    if (/\d/.test(password)) score++;    // 包含数字
    if (/[^a-zA-Z0-9]/.test(password)) score++; // 包含特殊字符

    // 避免常见模式（降低权重）
    const lowerPassword = password.toLowerCase();
    const hasCommonPattern = COMMON_PATTERNS.some(pattern =>
        lowerPassword.includes(pattern)
    );
    if (!hasCommonPattern && password.length >= 8) score++; // 只有8位以上才检查

    return score;
}

/**
 * 根据分数确定密码强度等级（降低门槛）
 * @param score 分数 (0-10+)
 * @returns 强度等级
 */
function getStrengthLevel(score: number): PasswordStrengthLevel {
    if (score <= 1) return 'VERY_WEAK';  // 0-1分：极弱
    if (score <= 3) return 'WEAK';       // 2-3分：弱
    if (score <= 5) return 'MEDIUM';     // 4-5分：中等
    if (score <= 7) return 'STRONG';     // 6-7分：强
    return 'VERY_STRONG';                // 8+分：极强
}

/**
 * 获取强度等级的中文描述
 * @param level 强度等级
 * @returns 中文描述
 */
function getStrengthDescription(level: PasswordStrengthLevel): string {
    const descriptions: Record<PasswordStrengthLevel, string> = {
        VERY_WEAK: '极弱',
        WEAK: '弱',
        MEDIUM: '中等',
        STRONG: '强',
        VERY_STRONG: '极强',
    };
    return descriptions[level];
}

/**
 * 生成密码改进建议
 * @param password 密码字符串
 * @param score 强度分数
 * @returns 建议数组
 */
function getPasswordSuggestions(password: string, score: number): string[] {
    const suggestions: string[] = [];

    // 最低长度要求（6位）
    if (password.length < 6) {
        suggestions.push('至少6个字符');
        return suggestions;
    }

    // 常见弱密码警告（优先提示）
    const lowerPassword = password.toLowerCase();
    const hasCommonPattern = COMMON_PATTERNS.some(pattern =>
        lowerPassword.includes(pattern)
    );
    if (hasCommonPattern) {
        suggestions.push('避免常见密码');
    }

    // 长度建议（温和提示，非强制）
    if (password.length < 8 && suggestions.length === 0) {
        suggestions.push('建议8位以上更安全');
    }

    // 字符类型建议（仅作为改进建议，不强制）
    if (score < 5 && suggestions.length === 0) {
        const missing: string[] = [];
        if (!/[A-Z]/.test(password)) missing.push('大写字母');
        if (!/\d/.test(password)) missing.push('数字');

        if (missing.length > 0) {
            suggestions.push(`可添加${missing.join('或')}提升强度`);
        }
    }

    // 正面反馈
    if (suggestions.length === 0) {
        if (score >= 8) {
            suggestions.push('✓ 密码强度极佳');
        } else if (score >= 6) {
            suggestions.push('✓ 密码强度良好');
        } else if (score >= 4) {
            suggestions.push('✓ 密码强度合格');
        }
    }

    return suggestions;
}

/**
 * 获取完整的密码强度信息
 * @param password 密码字符串
 * @returns 密码强度信息对象
 */
export function getPasswordStrengthInfo(password: string): PasswordStrengthInfo {
    const score = calculatePasswordStrength(password);
    const level = getStrengthLevel(score);
    const description = getStrengthDescription(level);
    const suggestions = getPasswordSuggestions(password, score);

    // 将分数转换为 0-100 的百分比用于显示
    // 最大分数按 10 分计算 (实际可能更高)
    const displayScore = Math.min((score / 10) * 100, 100);

    return {
        level,
        score: Math.round(displayScore),
        description,
        suggestions,
    };
}

/**
 * 验证单个密码字段
 * @param password 密码
 * @returns 错误消息，无错误则返回空字符串
 */
export function validatePassword(password: string): string {
    if (!password || password.trim() === '') {
        return '密码不能为空';
    }
    if (password.length < 6) {
        return '密码长度至少需要6个字符';
    }
    if (password.length > 100) {
        return '密码长度不能超过100个字符';
    }
    return '';
}

/**
 * 验证密码是否匹配
 * @param newPassword 新密码
 * @param confirmPassword 确认密码
 * @returns 错误消息，无错误则返回空字符串
 */
export function validatePasswordMatch(newPassword: string, confirmPassword: string): string {
    if (!confirmPassword || confirmPassword.trim() === '') {
        return '确认密码不能为空';
    }
    if (newPassword !== confirmPassword) {
        return '密码不一致，请重新输入';
    }
    return '';
}

/**
 * 验证完整的密码修改表单
 * @param formData 表单数据
 * @returns 错误对象，键为字段名，值为错误消息
 */
export function validatePasswordChangeForm(
    formData: ChangePasswordRequest
): Record<string, string> {
    const errors: Record<string, string> = {};

    // 验证旧密码
    if (!formData.oldPassword || formData.oldPassword.trim() === '') {
        errors.oldPassword = '旧密码不能为空';
    }

    // 验证新密码
    const newPasswordError = validatePassword(formData.newPassword);
    if (newPasswordError) {
        errors.newPassword = newPasswordError;
    } else if (formData.oldPassword && formData.newPassword === formData.oldPassword) {
        errors.newPassword = '新密码不能与旧密码相同';
    }

    // 验证确认密码
    const confirmPasswordError = validatePasswordMatch(
        formData.newPassword,
        formData.confirmPassword
    );
    if (confirmPasswordError) {
        errors.confirmPassword = confirmPasswordError;
    }

    return errors;
}
