import type { Result, LoginRequest, LoginResponse, MemberApplicationRequest } from '@/types/auth';
import type { MemberResponse } from '@/types/member';

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
