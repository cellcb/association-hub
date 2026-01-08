import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getSiteConfig } from '@/lib/api';
import type { SiteConfig } from '@/types/config';

interface SiteConfigContextType {
  config: SiteConfig | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const SiteConfigContext = createContext<SiteConfigContextType | undefined>(undefined);

interface SiteConfigProviderProps {
  children: ReactNode;
}

export function SiteConfigProvider({ children }: SiteConfigProviderProps) {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getSiteConfig();
      if (result.success && result.data) {
        setConfig(result.data);
      } else {
        setError(result.message || '加载配置失败');
      }
    } catch (err) {
      setError('网络错误，无法加载配置');
      console.error('Failed to load site config:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  return (
    <SiteConfigContext.Provider value={{ config, loading, error, refetch: fetchConfig }}>
      {children}
    </SiteConfigContext.Provider>
  );
}

export function useSiteConfig() {
  const context = useContext(SiteConfigContext);
  if (context === undefined) {
    throw new Error('useSiteConfig must be used within a SiteConfigProvider');
  }
  return context;
}

// Helper function to get config value with fallback
export function useConfigValue<T>(key: keyof SiteConfig, fallback: T): T {
  const { config } = useSiteConfig();
  if (!config || config[key] === undefined) {
    return fallback;
  }
  return config[key] as T;
}
