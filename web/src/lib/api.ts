import type { Result, LoginRequest, LoginResponse, MemberApplicationRequest, ChangePasswordRequest } from '@/types/auth';
import type { MemberResponse, MemberRegistrationProfile } from '@/types/member';

const API_BASE = '/api';

// Token 存储 key
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

/**
 * 获取存储的 access token
 */
export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

/**
 * 获取存储的 refresh token
 */
export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

/**
 * 存储 tokens
 */
export function setTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

/**
 * 清除 tokens
 */
export function clearTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

/**
 * 封装的 fetch 请求
 */
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<Result<T>> {
  const url = `${API_BASE}${endpoint}`;
  const token = getAccessToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data: Result<T> = await response.json();

  // 如果返回 401 且有 refresh token，尝试刷新
  if (response.status === 401 && getRefreshToken()) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      // 重试原请求
      const newToken = getAccessToken();
      if (newToken) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${newToken}`;
      }
      const retryResponse = await fetch(url, { ...options, headers });
      return retryResponse.json();
    }
  }

  return data;
}

/**
 * 尝试刷新 token
 */
async function tryRefreshToken(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  try {
    const response = await fetch(`${API_BASE}/iam/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      clearTokens();
      return false;
    }

    const data: Result<LoginResponse> = await response.json();
    if (data.success && data.data) {
      setTokens(data.data.accessToken, data.data.refreshToken);
      return true;
    }

    clearTokens();
    return false;
  } catch {
    clearTokens();
    return false;
  }
}

// ========== Auth API ==========

/**
 * 用户登录
 */
export async function login(credentials: LoginRequest): Promise<Result<LoginResponse>> {
  const response = await fetch(`${API_BASE}/iam/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  const data: Result<LoginResponse> = await response.json();

  if (data.success && data.data) {
    setTokens(data.data.accessToken, data.data.refreshToken);
  }

  return data;
}

/**
 * 用户登出
 */
export async function logout(): Promise<void> {
  try {
    await request('/iam/auth/logout', { method: 'POST' });
  } finally {
    clearTokens();
  }
}

/**
 * 获取当前用户信息
 */
export async function getUserInfo(): Promise<Result<LoginResponse['user']>> {
  return request('/iam/auth/userinfo');
}

/**
 * 验证 token
 */
export async function validateToken(): Promise<Result<boolean>> {
  return request('/iam/auth/validate');
}

/**
 * 修改密码
 */
export async function changePassword(data: ChangePasswordRequest): Promise<Result<void>> {
  return request<void>('/iam/users/me/change-password', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ========== Member Application API ==========

/**
 * 提交会员申请
 */
export async function submitMemberApplication(
  application: MemberApplicationRequest
): Promise<Result<MemberResponse>> {
  const response = await fetch(`${API_BASE}/members/apply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(application),
  });

  return response.json();
}

/**
 * 检查用户名是否可用
 */
export async function checkUsername(username: string): Promise<Result<boolean>> {
  const response = await fetch(
    `${API_BASE}/members/check-username?username=${encodeURIComponent(username)}`
  );
  return response.json();
}

/**
 * 检查邮箱是否可用
 */
export async function checkEmail(email: string): Promise<Result<boolean>> {
  const response = await fetch(
    `${API_BASE}/members/check-email?email=${encodeURIComponent(email)}`
  );
  return response.json();
}

// ========== Admin Member Management API ==========

import type {
  Page,
  PageParams,
  MemberStatsResponse,
  MemberType,
  MemberStatus,
  IndividualMemberUpdateRequest,
  OrganizationMemberUpdateRequest,
} from '@/types/member';

/**
 * 构建分页查询参数
 */
function buildPageParams(params?: PageParams): string {
  const searchParams = new URLSearchParams();
  if (params?.page !== undefined) searchParams.append('page', params.page.toString());
  if (params?.size !== undefined) searchParams.append('size', params.size.toString());
  if (params?.sort) searchParams.append('sort', params.sort);
  return searchParams.toString();
}

/**
 * 获取会员列表
 */
export async function getMembers(params?: PageParams): Promise<Result<Page<MemberResponse>>> {
  const query = buildPageParams(params);
  return request(`/admin/members${query ? `?${query}` : ''}`);
}

/**
 * 获取会员详情
 */
export async function getMemberById(id: number): Promise<Result<MemberResponse>> {
  return request(`/admin/members/${id}`);
}

/**
 * 搜索会员
 */
export async function searchMembers(
  keyword: string,
  params?: PageParams
): Promise<Result<Page<MemberResponse>>> {
  const query = buildPageParams(params);
  const keywordParam = `keyword=${encodeURIComponent(keyword)}`;
  return request(`/admin/members/search?${keywordParam}${query ? `&${query}` : ''}`);
}

/**
 * 按状态获取会员
 */
export async function getMembersByStatus(
  status: MemberStatus,
  params?: PageParams
): Promise<Result<Page<MemberResponse>>> {
  const query = buildPageParams(params);
  return request(`/admin/members/by-status/${status}${query ? `?${query}` : ''}`);
}

/**
 * 按类型获取会员
 */
export async function getMembersByType(
  type: MemberType,
  params?: PageParams
): Promise<Result<Page<MemberResponse>>> {
  const query = buildPageParams(params);
  return request(`/admin/members/by-type/${type}${query ? `?${query}` : ''}`);
}

/**
 * 更新个人会员
 */
export async function updateIndividualMember(
  id: number,
  data: IndividualMemberUpdateRequest
): Promise<Result<MemberResponse>> {
  return request(`/admin/members/${id}/individual`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * 更新单位会员
 */
export async function updateOrganizationMember(
  id: number,
  data: OrganizationMemberUpdateRequest
): Promise<Result<MemberResponse>> {
  return request(`/admin/members/${id}/organization`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * 暂停会员
 */
export async function suspendMember(id: number): Promise<Result<void>> {
  return request(`/admin/members/${id}/suspend`, { method: 'POST' });
}

/**
 * 激活会员
 */
export async function activateMember(id: number): Promise<Result<void>> {
  return request(`/admin/members/${id}/activate`, { method: 'POST' });
}

/**
 * 删除会员
 */
export async function deleteMember(id: number): Promise<Result<void>> {
  return request(`/admin/members/${id}`, { method: 'DELETE' });
}

/**
 * 获取会员统计
 */
export async function getMemberStats(): Promise<Result<MemberStatsResponse>> {
  return request('/admin/members/stats');
}

// ========== Admin Application Approval API ==========

/**
 * 审核通过会员申请
 */
export async function approveApplication(id: number): Promise<Result<MemberResponse>> {
  return request(`/admin/members/${id}/approve`, { method: 'POST' });
}

/**
 * 审核拒绝会员申请
 */
export async function rejectApplication(id: number, reason?: string): Promise<Result<void>> {
  const query = reason ? `?reason=${encodeURIComponent(reason)}` : '';
  return request(`/admin/members/${id}/reject${query}`, { method: 'POST' });
}

/**
 * 获取待审核会员数量
 */
export async function getPendingCount(): Promise<Result<number>> {
  return request('/admin/members/pending/count');
}

// ========== Admin News API ==========

import type { NewsListResponse, NewsResponse, NewsRequest, NewsCategoryResponse, TagResponse } from '@/types/news';

/**
 * 获取新闻列表
 */
export async function getNewsList(
  params?: PageParams & { status?: number; categoryId?: number }
): Promise<Result<Page<NewsListResponse>>> {
  const searchParams = new URLSearchParams();
  if (params?.page !== undefined) searchParams.append('page', params.page.toString());
  if (params?.size !== undefined) searchParams.append('size', params.size.toString());
  if (params?.sort) searchParams.append('sort', params.sort);
  if (params?.status !== undefined) searchParams.append('status', params.status.toString());
  if (params?.categoryId !== undefined) searchParams.append('categoryId', params.categoryId.toString());
  const query = searchParams.toString();
  return request(`/admin/news${query ? `?${query}` : ''}`);
}

/**
 * 获取新闻详情
 */
export async function getNewsById(id: number): Promise<Result<NewsResponse>> {
  return request(`/admin/news/${id}`);
}

/**
 * 创建新闻
 */
export async function createNews(data: NewsRequest): Promise<Result<NewsResponse>> {
  return request('/admin/news', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * 更新新闻
 */
export async function updateNews(id: number, data: NewsRequest): Promise<Result<NewsResponse>> {
  return request(`/admin/news/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * 删除新闻
 */
export async function deleteNews(id: number): Promise<Result<void>> {
  return request(`/admin/news/${id}`, { method: 'DELETE' });
}

/**
 * 发布新闻
 */
export async function publishNews(id: number): Promise<Result<void>> {
  return request(`/admin/news/${id}/publish`, { method: 'POST' });
}

/**
 * 取消发布新闻
 */
export async function unpublishNews(id: number): Promise<Result<void>> {
  return request(`/admin/news/${id}/unpublish`, { method: 'POST' });
}

/**
 * 获取新闻分类列表
 */
export async function getNewsCategories(): Promise<Result<NewsCategoryResponse[]>> {
  return request('/news/categories');
}

/**
 * 获取所有标签
 */
export async function getTags(): Promise<Result<TagResponse[]>> {
  return request('/tags');
}

/**
 * 创建标签
 */
export async function createTag(name: string): Promise<Result<TagResponse>> {
  return request('/tags', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
}

// ========== Admin Expert API ==========

import type {
  ExpertListResponse,
  ExpertResponse,
  ExpertRequest,
  ExpertiseFieldResponse,
  ExpertiseFieldRequest,
} from '@/types/expert';

/**
 * 获取专家列表
 */
export async function getExperts(
  params?: PageParams & { status?: number }
): Promise<Result<Page<ExpertListResponse>>> {
  const searchParams = new URLSearchParams();
  if (params?.page !== undefined) searchParams.append('page', params.page.toString());
  if (params?.size !== undefined) searchParams.append('size', params.size.toString());
  if (params?.sort) searchParams.append('sort', params.sort);
  if (params?.status !== undefined) searchParams.append('status', params.status.toString());
  const query = searchParams.toString();
  return request(`/admin/experts${query ? `?${query}` : ''}`);
}

/**
 * 获取专家详情
 */
export async function getExpertById(id: number): Promise<Result<ExpertResponse>> {
  return request(`/admin/experts/${id}`);
}

/**
 * 创建专家
 */
export async function createExpert(data: ExpertRequest): Promise<Result<ExpertResponse>> {
  return request('/admin/experts', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * 更新专家
 */
export async function updateExpert(id: number, data: ExpertRequest): Promise<Result<ExpertResponse>> {
  return request(`/admin/experts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * 删除专家
 */
export async function deleteExpert(id: number): Promise<Result<void>> {
  return request(`/admin/experts/${id}`, { method: 'DELETE' });
}

/**
 * 获取专业领域列表
 */
export async function getExpertiseFields(): Promise<Result<ExpertiseFieldResponse[]>> {
  return request('/expertise-fields');
}

// ========== Admin Expertise Field API ==========

/**
 * 获取管理端专业领域列表
 */
export async function getAdminExpertiseFields(): Promise<Result<ExpertiseFieldResponse[]>> {
  return request('/admin/expertise-fields');
}

/**
 * 获取专业领域详情
 */
export async function getAdminExpertiseFieldById(id: number): Promise<Result<ExpertiseFieldResponse>> {
  return request(`/admin/expertise-fields/${id}`);
}

/**
 * 创建专业领域
 */
export async function createExpertiseField(data: ExpertiseFieldRequest): Promise<Result<ExpertiseFieldResponse>> {
  return request('/admin/expertise-fields', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * 更新专业领域
 */
export async function updateExpertiseField(id: number, data: ExpertiseFieldRequest): Promise<Result<ExpertiseFieldResponse>> {
  return request(`/admin/expertise-fields/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * 删除专业领域
 */
export async function deleteExpertiseField(id: number): Promise<Result<void>> {
  return request(`/admin/expertise-fields/${id}`, { method: 'DELETE' });
}

// ========== Admin Project Category API ==========

import type {
  ProjectCategoryResponse,
  ProjectCategoryRequest,
} from '@/types/project';

/**
 * 获取管理端项目类别列表
 */
export async function getAdminProjectCategories(): Promise<Result<ProjectCategoryResponse[]>> {
  return request('/admin/project-categories');
}

/**
 * 获取项目类别详情
 */
export async function getAdminProjectCategoryById(id: number): Promise<Result<ProjectCategoryResponse>> {
  return request(`/admin/project-categories/${id}`);
}

/**
 * 创建项目类别
 */
export async function createProjectCategory(data: ProjectCategoryRequest): Promise<Result<ProjectCategoryResponse>> {
  return request('/admin/project-categories', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * 更新项目类别
 */
export async function updateProjectCategory(id: number, data: ProjectCategoryRequest): Promise<Result<ProjectCategoryResponse>> {
  return request(`/admin/project-categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * 删除项目类别
 */
export async function deleteProjectCategory(id: number): Promise<Result<void>> {
  return request(`/admin/project-categories/${id}`, { method: 'DELETE' });
}

/**
 * 获取公开项目类别列表（用于下拉框）
 */
export async function getProjectCategories(): Promise<Result<ProjectCategoryResponse[]>> {
  return request('/project-categories');
}

// ========== Admin Project API ==========

import type {
  ProjectListResponse,
  ProjectResponse,
  ProjectRequest,
  ProjectCategory,
} from '@/types/project';

/**
 * 获取项目列表
 */
export async function getProjects(
  params?: PageParams & { status?: number; category?: ProjectCategory }
): Promise<Result<Page<ProjectListResponse>>> {
  const searchParams = new URLSearchParams();
  if (params?.page !== undefined) searchParams.append('page', params.page.toString());
  if (params?.size !== undefined) searchParams.append('size', params.size.toString());
  if (params?.sort) searchParams.append('sort', params.sort);
  if (params?.status !== undefined) searchParams.append('status', params.status.toString());
  if (params?.category) searchParams.append('category', params.category);
  const query = searchParams.toString();
  return request(`/admin/projects${query ? `?${query}` : ''}`);
}

/**
 * 获取项目详情
 */
export async function getProjectById(id: number): Promise<Result<ProjectResponse>> {
  return request(`/admin/projects/${id}`);
}

/**
 * 创建项目
 */
export async function createProject(data: ProjectRequest): Promise<Result<ProjectResponse>> {
  return request('/admin/projects', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * 更新项目
 */
export async function updateProject(id: number, data: ProjectRequest): Promise<Result<ProjectResponse>> {
  return request(`/admin/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * 删除项目
 */
export async function deleteProject(id: number): Promise<Result<void>> {
  return request(`/admin/projects/${id}`, { method: 'DELETE' });
}

// ========== Admin Activity API ==========

import type {
  ActivityListResponse,
  ActivityResponse,
  ActivityRequest,
  ActivityStatus,
  ActivityType,
  RegistrationRequest,
  RegistrationResponse,
  RegistrationStatus,
} from '@/types/activity';

/**
 * 获取活动列表
 */
export async function getActivities(
  params?: PageParams & { status?: ActivityStatus; type?: ActivityType }
): Promise<Result<Page<ActivityListResponse>>> {
  const searchParams = new URLSearchParams();
  if (params?.page !== undefined) searchParams.append('page', params.page.toString());
  if (params?.size !== undefined) searchParams.append('size', params.size.toString());
  if (params?.sort) searchParams.append('sort', params.sort);
  if (params?.status) searchParams.append('status', params.status);
  if (params?.type) searchParams.append('type', params.type);
  const query = searchParams.toString();
  return request(`/admin/activities${query ? `?${query}` : ''}`);
}

/**
 * 获取活动详情
 */
export async function getActivityById(id: number): Promise<Result<ActivityResponse>> {
  return request(`/admin/activities/${id}`);
}

/**
 * 创建活动
 */
export async function createActivity(data: ActivityRequest): Promise<Result<ActivityResponse>> {
  return request('/admin/activities', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * 更新活动
 */
export async function updateActivity(id: number, data: ActivityRequest): Promise<Result<ActivityResponse>> {
  return request(`/admin/activities/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * 删除活动
 */
export async function deleteActivity(id: number): Promise<Result<void>> {
  return request(`/admin/activities/${id}`, { method: 'DELETE' });
}

/**
 * 更新活动状态
 */
export async function updateActivityStatus(id: number, status: ActivityStatus): Promise<Result<void>> {
  return request(`/admin/activities/${id}/status?status=${status}`, { method: 'PUT' });
}

/**
 * 获取活动报名列表
 */
export async function getActivityRegistrations(
  activityId: number,
  params?: PageParams & { status?: RegistrationStatus }
): Promise<Result<Page<RegistrationResponse>>> {
  const searchParams = new URLSearchParams();
  if (params?.page !== undefined) searchParams.append('page', params.page.toString());
  if (params?.size !== undefined) searchParams.append('size', params.size.toString());
  if (params?.sort) searchParams.append('sort', params.sort);
  if (params?.status) searchParams.append('status', params.status);
  const query = searchParams.toString();
  return request(`/admin/activities/${activityId}/registrations${query ? `?${query}` : ''}`);
}

/**
 * 更新报名状态
 */
export async function updateRegistrationStatus(regId: number, status: RegistrationStatus): Promise<Result<void>> {
  return request(`/admin/activities/registrations/${regId}/status?status=${status}`, { method: 'PUT' });
}

/**
 * 取消报名
 */
export async function cancelRegistration(regId: number): Promise<Result<void>> {
  return request(`/admin/activities/registrations/${regId}`, { method: 'DELETE' });
}

// ========== Public Activity API ==========

/**
 * 获取公开活动列表
 */
export async function getPublicActivities(
  params?: PageParams & { keyword?: string; type?: ActivityType }
): Promise<Result<Page<ActivityListResponse>>> {
  const searchParams = new URLSearchParams();
  if (params?.page !== undefined) searchParams.append('page', params.page.toString());
  if (params?.size !== undefined) searchParams.append('size', params.size.toString());
  if (params?.sort) searchParams.append('sort', params.sort);
  if (params?.keyword) searchParams.append('keyword', params.keyword);
  if (params?.type) searchParams.append('type', params.type);
  const query = searchParams.toString();
  return request(`/activities${query ? `?${query}` : ''}`);
}

/**
 * 获取公开活动详情
 */
export async function getPublicActivityById(id: number): Promise<Result<ActivityResponse>> {
  return request(`/activities/${id}`);
}

/**
 * 活动报名
 */
export async function registerActivity(
  activityId: number,
  data: RegistrationRequest
): Promise<Result<RegistrationResponse>> {
  return request(`/activities/${activityId}/register`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * 检查是否已报名
 */
export async function checkActivityRegistration(
  activityId: number,
  phone: string
): Promise<Result<boolean>> {
  return request(`/activities/${activityId}/check-registration?phone=${encodeURIComponent(phone)}`);
}

/**
 * 获取我的报名列表
 */
export async function getMyRegistrations(
  params?: PageParams
): Promise<Result<Page<RegistrationResponse>>> {
  const searchParams = new URLSearchParams();
  if (params?.page !== undefined) searchParams.append('page', params.page.toString());
  if (params?.size !== undefined) searchParams.append('size', params.size.toString());
  if (params?.sort) searchParams.append('sort', params.sort);
  const query = searchParams.toString();
  return request(`/activities/my-registrations${query ? `?${query}` : ''}`);
}

/**
 * 用户档案响应（包含会员信息）
 */
interface UserProfileResponse {
  id: number;
  username: string;
  email: string;
  phone: string;
  realName: string;
  memberProfile?: MemberRegistrationProfile;
}

/**
 * 获取当前登录用户的会员报名信息（用于活动报名自动填充）
 * 通过 /api/iam/users/me 接口获取用户档案，提取会员信息
 * 如果未登录或非活跃会员，返回 null
 */
export async function getMyMemberRegistrationProfile(): Promise<Result<MemberRegistrationProfile | null>> {
  const res = await request<UserProfileResponse>('/iam/users/me');
  if (res.success && res.data?.memberProfile) {
    return { ...res, data: res.data.memberProfile };
  }
  return { ...res, data: null };
}

// ========== Member Self-Service API ==========

/**
 * 获取当前登录用户的完整会员信息
 */
export async function getMyMemberProfile(): Promise<Result<MemberResponse>> {
  return request('/members/me');
}

/**
 * 更新当前用户的个人会员信息
 */
export async function updateMyIndividualProfile(
  data: IndividualMemberUpdateRequest
): Promise<Result<MemberResponse>> {
  return request('/members/me/individual', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * 更新当前用户的单位会员信息
 */
export async function updateMyOrganizationProfile(
  data: OrganizationMemberUpdateRequest
): Promise<Result<MemberResponse>> {
  return request('/members/me/organization', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// ========== Public Product API ==========

import type {
  ProductListResponse,
  ProductResponse,
  ProductRequest,
  ProductCategoryResponse,
  ProductCategoryRequest,
} from '@/types/product';

/**
 * 获取公开产品列表（前台展示）
 */
export async function getPublicProducts(
  params?: PageParams & { keyword?: string; categoryId?: number }
): Promise<Result<Page<ProductListResponse>>> {
  const searchParams = new URLSearchParams();
  if (params?.page !== undefined) searchParams.append('page', params.page.toString());
  if (params?.size !== undefined) searchParams.append('size', params.size.toString());
  if (params?.sort) searchParams.append('sort', params.sort);
  if (params?.categoryId !== undefined) searchParams.append('categoryId', params.categoryId.toString());
  if (params?.keyword) searchParams.append('keyword', params.keyword);
  const query = searchParams.toString();
  return request(`/products${query ? `?${query}` : ''}`);
}

/**
 * 获取公开产品详情（前台展示）
 */
export async function getPublicProductById(id: number): Promise<Result<ProductResponse>> {
  return request(`/products/${id}`);
}

/**
 * 增加产品浏览量
 */
export async function incrementProductViews(id: number): Promise<Result<void>> {
  return request(`/products/${id}/view`, { method: 'POST' });
}

// ========== Admin Product API ==========

/**
 * 获取产品列表
 */
export async function getProducts(
  params?: PageParams & { status?: number; categoryId?: number; keyword?: string }
): Promise<Result<Page<ProductListResponse>>> {
  const searchParams = new URLSearchParams();
  if (params?.page !== undefined) searchParams.append('page', params.page.toString());
  if (params?.size !== undefined) searchParams.append('size', params.size.toString());
  if (params?.sort) searchParams.append('sort', params.sort);
  if (params?.status !== undefined) searchParams.append('status', params.status.toString());
  if (params?.categoryId !== undefined) searchParams.append('categoryId', params.categoryId.toString());
  if (params?.keyword) searchParams.append('keyword', params.keyword);
  const query = searchParams.toString();
  return request(`/admin/products${query ? `?${query}` : ''}`);
}

/**
 * 获取产品详情
 */
export async function getProductById(id: number): Promise<Result<ProductResponse>> {
  return request(`/admin/products/${id}`);
}

/**
 * 创建产品
 */
export async function createProduct(data: ProductRequest): Promise<Result<ProductResponse>> {
  return request('/admin/products', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * 更新产品
 */
export async function updateProduct(id: number, data: ProductRequest): Promise<Result<ProductResponse>> {
  return request(`/admin/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * 删除产品
 */
export async function deleteProduct(id: number): Promise<Result<void>> {
  return request(`/admin/products/${id}`, { method: 'DELETE' });
}

/**
 * 获取产品分类列表
 */
export async function getProductCategories(): Promise<Result<ProductCategoryResponse[]>> {
  return request('/products/categories');
}

// ========== Admin Product Category API ==========

/**
 * 获取管理端产品分类列表
 */
export async function getAdminProductCategories(): Promise<Result<ProductCategoryResponse[]>> {
  return request('/admin/product-categories');
}

/**
 * 获取管理端产品分类树
 */
export async function getAdminProductCategoryTree(): Promise<Result<ProductCategoryResponse[]>> {
  return request('/admin/product-categories/tree');
}

/**
 * 获取产品分类详情
 */
export async function getAdminProductCategoryById(id: number): Promise<Result<ProductCategoryResponse>> {
  return request(`/admin/product-categories/${id}`);
}

/**
 * 创建产品分类
 */
export async function createProductCategory(data: ProductCategoryRequest): Promise<Result<ProductCategoryResponse>> {
  return request('/admin/product-categories', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * 更新产品分类
 */
export async function updateProductCategory(id: number, data: ProductCategoryRequest): Promise<Result<ProductCategoryResponse>> {
  return request(`/admin/product-categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * 删除产品分类
 */
export async function deleteProductCategory(id: number): Promise<Result<void>> {
  return request(`/admin/product-categories/${id}`, { method: 'DELETE' });
}

// ========== Public Manufacturer API ==========

import type {
  ManufacturerListResponse,
  ManufacturerResponse,
  ManufacturerRequest,
  ManufacturerCategoryResponse,
} from '@/types/manufacturer';

/**
 * 获取公开厂商列表（前台展示）
 */
export async function getPublicManufacturers(
  params?: PageParams & { keyword?: string; categoryId?: number }
): Promise<Result<Page<ManufacturerListResponse>>> {
  const searchParams = new URLSearchParams();
  if (params?.page !== undefined) searchParams.append('page', params.page.toString());
  if (params?.size !== undefined) searchParams.append('size', params.size.toString());
  if (params?.sort) searchParams.append('sort', params.sort);
  if (params?.categoryId !== undefined) searchParams.append('categoryId', params.categoryId.toString());
  if (params?.keyword) searchParams.append('keyword', params.keyword);
  const query = searchParams.toString();
  return request(`/manufacturers${query ? `?${query}` : ''}`);
}

/**
 * 获取公开厂商详情（前台展示）
 */
export async function getPublicManufacturerById(id: number): Promise<Result<ManufacturerResponse>> {
  return request(`/manufacturers/${id}`);
}

/**
 * 增加厂商浏览量
 */
export async function incrementManufacturerViews(id: number): Promise<Result<void>> {
  return request(`/manufacturers/${id}/views`, { method: 'POST' });
}

/**
 * 获取厂商分类列表
 */
export async function getManufacturerCategories(): Promise<Result<ManufacturerCategoryResponse[]>> {
  return request('/manufacturers/categories');
}

// ========== Admin Manufacturer API ==========

/**
 * 获取厂商列表（管理端）
 */
export async function getManufacturers(
  params?: PageParams & { status?: number; categoryId?: number; keyword?: string }
): Promise<Result<Page<ManufacturerListResponse>>> {
  const searchParams = new URLSearchParams();
  if (params?.page !== undefined) searchParams.append('page', params.page.toString());
  if (params?.size !== undefined) searchParams.append('size', params.size.toString());
  if (params?.sort) searchParams.append('sort', params.sort);
  if (params?.status !== undefined) searchParams.append('status', params.status.toString());
  if (params?.categoryId !== undefined) searchParams.append('categoryId', params.categoryId.toString());
  if (params?.keyword) searchParams.append('keyword', params.keyword);
  const query = searchParams.toString();
  return request(`/admin/manufacturers${query ? `?${query}` : ''}`);
}

/**
 * 获取厂商详情（管理端）
 */
export async function getManufacturerById(id: number): Promise<Result<ManufacturerResponse>> {
  return request(`/admin/manufacturers/${id}`);
}

/**
 * 创建厂商
 */
export async function createManufacturer(data: ManufacturerRequest): Promise<Result<ManufacturerResponse>> {
  return request('/admin/manufacturers', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * 更新厂商
 */
export async function updateManufacturer(id: number, data: ManufacturerRequest): Promise<Result<ManufacturerResponse>> {
  return request(`/admin/manufacturers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * 删除厂商
 */
export async function deleteManufacturer(id: number): Promise<Result<void>> {
  return request(`/admin/manufacturers/${id}`, { method: 'DELETE' });
}

// ========== System Config API ==========

import type { ConfigResponse, ConfigUpdateRequest, SiteConfig } from '@/types/config';

/**
 * 获取网站配置（公开API，无需认证）
 */
export async function getSiteConfig(): Promise<Result<SiteConfig>> {
  const response = await fetch(`${API_BASE}/public/configs/site`);
  return response.json();
}

/**
 * 获取所有配置（后台管理）
 */
export async function getConfigs(
  params?: PageParams
): Promise<Result<Page<ConfigResponse>>> {
  const query = buildPageParams(params);
  return request(`/admin/configs${query ? `?${query}` : ''}`);
}

/**
 * 获取配置详情
 */
export async function getConfigById(id: number): Promise<Result<ConfigResponse>> {
  return request(`/admin/configs/${id}`);
}

/**
 * 根据配置键获取配置
 */
export async function getConfigByKey(configKey: string): Promise<Result<ConfigResponse>> {
  return request(`/admin/configs/key/${encodeURIComponent(configKey)}`);
}

/**
 * 按分类获取配置列表
 */
export async function getConfigsByCategory(category: string): Promise<Result<ConfigResponse[]>> {
  return request(`/admin/configs/category/${encodeURIComponent(category)}`);
}

/**
 * 更新配置
 */
export async function updateConfig(
  id: number,
  data: ConfigUpdateRequest
): Promise<Result<ConfigResponse>> {
  return request(`/admin/configs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * 更新配置值
 */
export async function updateConfigValue(id: number, value: string): Promise<Result<void>> {
  return request(`/admin/configs/${id}/value`, {
    method: 'PUT',
    body: value,
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}

// ========== Public News API (无需认证) ==========

/**
 * 获取公开新闻列表
 */
export async function getPublicNewsList(params?: {
  page?: number;
  size?: number;
  categoryId?: number;
  keyword?: string;
  tagId?: number;
  featured?: boolean;
}): Promise<Result<Page<NewsListResponse>>> {
  const searchParams = new URLSearchParams();
  if (params?.page !== undefined) searchParams.append('page', params.page.toString());
  if (params?.size !== undefined) searchParams.append('size', params.size.toString());
  if (params?.categoryId !== undefined) searchParams.append('categoryId', params.categoryId.toString());
  if (params?.keyword) searchParams.append('keyword', params.keyword);
  if (params?.tagId !== undefined) searchParams.append('tagId', params.tagId.toString());
  if (params?.featured !== undefined) searchParams.append('featured', params.featured.toString());
  const query = searchParams.toString();

  const response = await fetch(`${API_BASE}/news${query ? `?${query}` : ''}`);
  return response.json();
}

/**
 * 获取公开新闻详情
 */
export async function getPublicNewsById(id: number): Promise<Result<NewsResponse>> {
  const response = await fetch(`${API_BASE}/news/${id}`);
  return response.json();
}

/**
 * 增加新闻浏览量
 */
export async function incrementNewsViews(id: number): Promise<Result<void>> {
  const response = await fetch(`${API_BASE}/news/${id}/view`, { method: 'POST' });
  return response.json();
}

/**
 * 点赞新闻
 */
export async function likeNews(id: number): Promise<Result<void>> {
  const response = await fetch(`${API_BASE}/news/${id}/like`, { method: 'POST' });
  return response.json();
}

// ========== Public Expert API (无需认证) ==========

/**
 * 获取公开专家列表
 */
export async function getPublicExperts(params?: {
  page?: number;
  size?: number;
  keyword?: string;
  fieldId?: number;
  fieldCode?: string;
}): Promise<Result<Page<ExpertListResponse>>> {
  const searchParams = new URLSearchParams();
  if (params?.page !== undefined) searchParams.append('page', params.page.toString());
  if (params?.size !== undefined) searchParams.append('size', params.size.toString());
  if (params?.keyword) searchParams.append('keyword', params.keyword);
  if (params?.fieldId !== undefined) searchParams.append('fieldId', params.fieldId.toString());
  if (params?.fieldCode) searchParams.append('fieldCode', params.fieldCode);
  const query = searchParams.toString();

  const response = await fetch(`${API_BASE}/experts${query ? `?${query}` : ''}`);
  return response.json();
}

/**
 * 获取公开专家详情
 */
export async function getPublicExpertById(id: number): Promise<Result<ExpertResponse>> {
  const response = await fetch(`${API_BASE}/experts/${id}`);
  return response.json();
}

// ========== Public Project API (无需认证) ==========

/**
 * 获取公开项目列表
 */
export async function getPublicProjects(params?: {
  page?: number;
  size?: number;
  keyword?: string;
  category?: ProjectCategory;
}): Promise<Result<Page<ProjectListResponse>>> {
  const searchParams = new URLSearchParams();
  if (params?.page !== undefined) searchParams.append('page', params.page.toString());
  if (params?.size !== undefined) searchParams.append('size', params.size.toString());
  if (params?.keyword) searchParams.append('keyword', params.keyword);
  if (params?.category) searchParams.append('category', params.category);
  const query = searchParams.toString();

  const response = await fetch(`${API_BASE}/projects${query ? `?${query}` : ''}`);
  return response.json();
}

/**
 * 获取公开项目详情
 */
export async function getPublicProjectById(id: number): Promise<Result<ProjectResponse>> {
  const response = await fetch(`${API_BASE}/projects/${id}`);
  return response.json();
}

/**
 * 增加项目浏览量
 */
export async function incrementProjectViews(id: number): Promise<Result<void>> {
  const response = await fetch(`${API_BASE}/projects/${id}/view`, { method: 'POST' });
  return response.json();
}
