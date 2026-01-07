// 新闻状态枚举（后端用数字）
export type NewsStatus = 0 | 1 | 2;  // 0=草稿, 1=已发布, 2=已归档

// 状态标签映射
export const newsStatusLabels: Record<NewsStatus, string> = {
  0: '草稿',
  1: '已发布',
  2: '已归档',
};

// 分类响应
export interface NewsCategoryResponse {
  id: number;
  name: string;
  code: string;
  sortOrder: number;
  status: number;
}

// 标签响应
export interface TagResponse {
  id: number;
  name: string;
  usageCount: number;
}

// 新闻列表项响应
export interface NewsListResponse {
  id: number;
  title: string;
  excerpt: string;
  categoryName: string;
  categoryId: number;
  author: string;
  coverImage: string | null;
  views: number;
  likes: number;
  featured: boolean;
  status: NewsStatus;
  publishedAt: string | null;
  tags: TagResponse[];
}

// 新闻详情响应
export interface NewsResponse extends Omit<NewsListResponse, 'categoryName'> {
  content: string;
  category: NewsCategoryResponse;
  createdTime: string;
  updatedTime: string;
}

// 创建/更新请求
export interface NewsRequest {
  title: string;
  excerpt?: string;
  content: string;
  categoryId: number;
  author?: string;
  coverImage?: string;
  featured?: boolean;
  status?: number;
  tagIds?: number[];
}
