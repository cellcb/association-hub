// 产品状态枚举（后端用数字）
export type ProductStatus = 0 | 1;  // 0=草稿, 1=已发布

// 状态标签映射
export const productStatusLabels: Record<ProductStatus, string> = {
  0: '草稿',
  1: '已发布',
};

// 产品分类响应
export interface ProductCategoryResponse {
  id: number;
  name: string;
  code: string;
  parentId: number | null;
  sortOrder: number;
  status: number;
  description: string | null;
  children?: ProductCategoryResponse[];
}

// 产品分类请求
export interface ProductCategoryRequest {
  name: string;
  code?: string;
  parentId?: number | null;
  sortOrder?: number;
  status?: number;
  description?: string;
}

// 产品列表响应
export interface ProductListResponse {
  id: number;
  name: string;
  categoryName: string;
  categoryId: number;
  manufacturer: string;
  model: string | null;
  price: string | null;
  summary: string | null;
  description: string;
  status: ProductStatus;
  views: number;
  images: string | null;
  featured: boolean;
}

// 产品详情响应
export interface ProductResponse {
  id: number;
  name: string;
  category: ProductCategoryResponse;
  manufacturer: string;
  model: string | null;
  price: string | null;
  summary: string | null;
  description: string;
  application: string;
  contactPhone: string;
  contactEmail: string;
  contact: string | null;
  website: string | null;
  status: ProductStatus;
  views: number;
  featured: boolean;
  createdTime: string;
  updatedTime: string;
  features: string | null;
  certifications: string | null;
  images: string | null;
  specifications: string | null;
}

// 创建/更新请求
export interface ProductRequest {
  name: string;
  categoryId?: number;
  manufacturer?: string;
  model?: string;
  price?: string;
  summary?: string;
  description?: string;
  application?: string;
  contactPhone?: string;
  contactEmail?: string;
  contact?: string;
  website?: string;
  status?: number;
  featured?: boolean;
  features?: string;
  certifications?: string;
  images?: string;
  specifications?: string;
}
