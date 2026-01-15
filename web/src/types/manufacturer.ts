export type ManufacturerStatus = 0 | 1;

export interface ManufacturerCategoryResponse {
  id: number;
  name: string;
  code: string;
  parentId: number | null;
  sortOrder: number;
  status: number;
  description: string | null;
  children?: ManufacturerCategoryResponse[];
}

export interface ManufacturerListResponse {
  id: number;
  name: string;
  categoryName: string;
  categoryId: number;
  logo: string | null;
  summary: string | null;
  address: string | null;
  mainBusiness: string | null;
  status: ManufacturerStatus;
  views: number;
  featured: boolean;
}

export interface ManufacturerResponse {
  id: number;
  name: string;
  category: ManufacturerCategoryResponse | null;
  logo: string | null;
  summary: string | null;
  description: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  contactPerson: string | null;
  address: string | null;
  website: string | null;
  establishedDate: string | null;
  registeredCapital: string | null;
  employeeScale: string | null;
  mainBusiness: string | null;
  qualifications: string | null;
  honors: string | null;
  images: string | null;
  status: ManufacturerStatus;
  views: number;
  featured: boolean;
  createdTime: string;
  updatedTime: string;
}

export interface ManufacturerRequest {
  name: string;
  categoryId?: number;
  logo?: string;
  summary?: string;
  description?: string;
  contactPhone?: string;
  contactEmail?: string;
  contactPerson?: string;
  address?: string;
  website?: string;
  establishedDate?: string;
  registeredCapital?: string;
  employeeScale?: string;
  mainBusiness?: string;
  qualifications?: string;
  honors?: string;
  images?: string;
  status?: number;
  featured?: boolean;
}
