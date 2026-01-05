package com.assoc.common.context;

import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Objects;

/**
 * 提供静态访问入口，方便非 Spring 管理的对象（如 JPA 实体监听器）使用请求上下文。
 */
@Component
public class RequestContextHolder implements InitializingBean {

    private static RequestContext delegate;

    private final RequestContext requestContext;

    @Autowired
    public RequestContextHolder(RequestContext requestContext) {
        this.requestContext = requestContext;
    }

    @Override
    public void afterPropertiesSet() {
        delegate = requestContext;
    }

    public static RequestContext getRequestContext() {
        return Objects.requireNonNull(delegate, "RequestContext 尚未初始化");
    }
}
