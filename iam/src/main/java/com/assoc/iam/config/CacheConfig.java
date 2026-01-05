package com.assoc.iam.config;

import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableCaching
public class CacheConfig {
    
    @Bean
    public CacheManager cacheManager() {
        ConcurrentMapCacheManager cacheManager = new ConcurrentMapCacheManager();
        // 配置权限相关的缓存
        cacheManager.setCacheNames(java.util.Arrays.asList(
            "userPermissions",      // 用户权限缓存
            "pathPermissions"       // 路径权限缓存
        ));
        return cacheManager;
    }
}
