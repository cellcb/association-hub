import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { UserInfo, LoginRequest } from '@/types/auth';
import * as api from '@/lib/api';

interface AuthContextType {
  user: UserInfo | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 初始化时检查登录状态
  useEffect(() => {
    const initAuth = async () => {
      const token = api.getAccessToken();
      if (token) {
        try {
          const result = await api.getUserInfo();
          if (result.success && result.data) {
            setUser(result.data);
          } else {
            api.clearTokens();
          }
        } catch {
          api.clearTokens();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = useCallback(async (credentials: LoginRequest) => {
    try {
      const result = await api.login(credentials);
      if (result.success && result.data) {
        setUser(result.data.user);
        return { success: true, message: result.message };
      }
      return { success: false, message: result.message || '登录失败' };
    } catch (error) {
      return { success: false, message: '网络错误，请稍后重试' };
    }
  }, []);

  const logout = useCallback(async () => {
    await api.logout();
    setUser(null);
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.roles?.includes('SUPER_ADMIN') ?? false,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
