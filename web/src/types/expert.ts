import { Page, PageParams } from './member';

// 专业领域响应
export interface ExpertiseFieldResponse {
  id: number;
  name: string;
  code: string;
  sortOrder: number;
  status: number;
  description?: string;
}

// 专业领域请求
export interface ExpertiseFieldRequest {
  name: string;
  code?: string;
  sortOrder?: number;
  status?: number;
  description?: string;
}

// 专家列表响应（用于卡片展示）
export interface ExpertListResponse {
  id: number;
  name: string;
  title: string;
  organization: string;
  location: string;
  avatar: string;
  status: number;
  expertiseFields: ExpertiseFieldResponse[];
  // 新增字段用于卡片展示
  achievements: string;
  email: string;
  phone: string; // 脱敏后的手机号，如 138****1234
}

// 专家详情响应（继承列表字段，添加详情字段）
export interface ExpertResponse extends ExpertListResponse {
  bio: string;
  education: string;
  experience: string;
  projects: string;
  publications: string;
  awards: string;
  researchAreas: string;
  createdTime: string;
  updatedTime: string;
}

// 创建/更新专家请求
export interface ExpertRequest {
  name: string;
  title?: string;
  organization?: string;
  location?: string;
  achievements?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  status?: number;
  expertiseFieldIds?: number[];
  education?: string;
  experience?: string;
  projects?: string;
  publications?: string;
  awards?: string;
  researchAreas?: string;
}

// 状态标签映射
export const expertStatusLabels: Record<number, string> = {
  1: '已发布',
  0: '草稿',
};

// Re-export for convenience
export type { Page, PageParams };
