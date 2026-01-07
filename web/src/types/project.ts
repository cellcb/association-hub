// 项目类别枚举
export type ProjectCategory =
  | 'SMART_BUILDING'    // 智能建筑
  | 'GREEN_BUILDING'    // 绿色建筑
  | 'BIM_APPLICATION'   // BIM应用
  | 'PREFABRICATED'     // 装配式建筑
  | 'RENOVATION';       // 既有建筑改造

// 类别标签映射
export const projectCategoryLabels: Record<ProjectCategory, string> = {
  SMART_BUILDING: '智能建筑',
  GREEN_BUILDING: '绿色建筑',
  BIM_APPLICATION: 'BIM应用',
  PREFABRICATED: '装配式建筑',
  RENOVATION: '既有建筑改造',
};

// 项目状态枚举（后端用数字）
export type ProjectStatus = 0 | 1;  // 0=草稿, 1=已发布

// 状态标签映射
export const projectStatusLabels: Record<ProjectStatus, string> = {
  0: '草稿',
  1: '已发布',
};

// 项目规模
export interface ProjectScale {
  area?: string;
  height?: string;
  investment?: string;
}

// 技术特点
export interface TechnicalFeature {
  title: string;
  description: string;
}

// 项目成果
export interface ProjectAchievement {
  title: string;
  value: string;
  description: string;
}

// 项目列表项响应
export interface ProjectListResponse {
  id: number;
  title: string;
  category: ProjectCategory;
  categoryName: string;
  location: string;
  completionDate: string | null;
  owner: string;
  views: number;
  status: ProjectStatus;
  coverImage: string | null;
  images: string | null;
}

// 项目详情响应
export interface ProjectResponse {
  id: number;
  title: string;
  category: ProjectCategory;
  categoryName: string;
  location: string;
  completionDate: string | null;
  owner: string;
  designer: string;
  contractor: string;
  description: string;
  background: string | null;
  designConcept: string | null;
  views: number;
  status: ProjectStatus;
  coverImage: string | null;
  createdTime: string;
  updatedTime: string;
  // JSON string fields
  highlights: string | null;
  projectAwards: string | null;
  scale: string | null;
  technicalFeatures: string | null;
  achievements: string | null;
  images: string | null;
}

// 创建/更新项目请求
export interface ProjectRequest {
  title: string;
  category: ProjectCategory;
  location?: string;
  completionDate?: string;
  owner?: string;
  designer?: string;
  contractor?: string;
  description?: string;
  background?: string;
  designConcept?: string;
  status?: number;
  coverImage?: string;
  // JSON string fields
  highlights?: string;
  projectAwards?: string;
  scale?: string;
  technicalFeatures?: string;
  achievements?: string;
  images?: string;
}

// 解析后的项目详情（用于前端展示）
export interface ParsedProjectResponse extends Omit<ProjectResponse, 'highlights' | 'projectAwards' | 'scale' | 'technicalFeatures' | 'achievements' | 'images'> {
  highlights: string[];
  projectAwards: string[];
  scale: ProjectScale | null;
  technicalFeatures: TechnicalFeature[];
  achievements: ProjectAchievement[];
  images: string[];
}

// JSON 解析辅助函数
export function parseProjectResponse(project: ProjectResponse): ParsedProjectResponse {
  return {
    ...project,
    highlights: parseJsonArray(project.highlights),
    projectAwards: parseJsonArray(project.projectAwards),
    scale: parseJsonObject<ProjectScale>(project.scale),
    technicalFeatures: parseJsonArray<TechnicalFeature>(project.technicalFeatures),
    achievements: parseJsonArray<ProjectAchievement>(project.achievements),
    images: parseJsonArray(project.images),
  };
}

function parseJsonArray<T = string>(json: string | null): T[] {
  if (!json) return [];
  try {
    return JSON.parse(json);
  } catch {
    return [];
  }
}

function parseJsonObject<T>(json: string | null): T | null {
  if (!json) return null;
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}
