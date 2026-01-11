import { AlertCircle, CheckCircle } from 'lucide-react';
import { getPasswordStrengthInfo } from '@/utils/passwordUtils';
import type { PasswordStrengthLevel } from '@/types/auth';

interface PasswordStrengthIndicatorProps {
    password: string;
    showDetails?: boolean;
}

/**
 * 密码强度指示器组件
 * 显示密码强度条、描述和改进建议
 */
export function PasswordStrengthIndicator({
    password,
    showDetails = true,
}: PasswordStrengthIndicatorProps) {
    // 如果密码为空，不显示任何内容
    if (!password) {
        return null;
    }

    const strengthInfo = getPasswordStrengthInfo(password);
    const { level, score, description, suggestions } = strengthInfo;

    // 根据强度等级选择颜色
    const getColorClasses = (strengthLevel: PasswordStrengthLevel) => {
        switch (strengthLevel) {
            case 'VERY_WEAK':
            case 'WEAK':
                return {
                    bar: 'bg-red-500',
                    text: 'text-red-600',
                    bg: 'bg-red-50',
                    border: 'border-red-200',
                };
            case 'MEDIUM':
                return {
                    bar: 'bg-orange-500',
                    text: 'text-orange-600',
                    bg: 'bg-orange-50',
                    border: 'border-orange-200',
                };
            case 'STRONG':
            case 'VERY_STRONG':
                return {
                    bar: 'bg-green-500',
                    text: 'text-green-600',
                    bg: 'bg-green-50',
                    border: 'border-green-200',
                };
        }
    };

    const colors = getColorClasses(level);

    return (
        <div className="space-y-2">
            {/* 强度条 */}
            <div>
                <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">密码强度</span>
                    <span className={`text-sm font-medium ${colors.text}`}>
                        {description}
                    </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className={`h-full ${colors.bar} transition-all duration-300`}
                        style={{ width: `${score}%` }}
                    />
                </div>
            </div>

            {/* 改进建议 */}
            {showDetails && suggestions.length > 0 && (
                <div className={`${colors.bg} ${colors.border} border rounded-lg p-3`}>
                    <div className="space-y-1.5">
                        {suggestions.map((suggestion, index) => (
                            <div key={index} className="flex items-start gap-2 text-sm">
                                {level === 'STRONG' || level === 'VERY_STRONG' ? (
                                    <CheckCircle className={`w-4 h-4 ${colors.text} flex-shrink-0 mt-0.5`} />
                                ) : (
                                    <AlertCircle className={`w-4 h-4 ${colors.text} flex-shrink-0 mt-0.5`} />
                                )}
                                <span className={colors.text}>{suggestion}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
