import type { Result, LoginRequest, LoginResponse, MemberApplicationRequest, MemberApplicationResponse } from '@/types/auth';

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
): Promise<Result<MemberApplicationResponse>> {
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
