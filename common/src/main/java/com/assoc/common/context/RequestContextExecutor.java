package com.assoc.common.context;

import org.springframework.stereotype.Component;

import java.util.Objects;
import java.util.concurrent.Callable;

/**
 * 提供跨线程传递 {@link RequestContext} 的工具，常用于异步执行或调度任务。
 */
@Component
public class RequestContextExecutor {

    private final RequestContext requestContext;

    public RequestContextExecutor(RequestContext requestContext) {
        this.requestContext = requestContext;
    }

    /**
     * 捕获当前线程的上下文快照。
     */
    public RequestContextSnapshot capture() {
        return requestContext.snapshot();
    }

    /**
     * 使用给定快照执行任务，执行后恢复原上下文。
     */
    public void runWithContext(RequestContextSnapshot snapshot, Runnable runnable) {
        Objects.requireNonNull(runnable, "runnable");
        RequestContextSnapshot previous = requestContext.snapshot();
        try {
            requestContext.restore(snapshot);
            runnable.run();
        } finally {
            if (previous != null) {
                requestContext.restore(previous);
            } else {
                requestContext.clear();
            }
        }
    }

    /**
     * 使用当前线程上下文执行任务，并为新线程提供快照。
     */
    public Runnable wrapCurrentContext(Runnable runnable) {
        RequestContextSnapshot snapshot = capture();
        return () -> runWithContext(snapshot, runnable);
    }

    /**
     * 使用给定快照执行并返回结果。
     */
    public <T> T callWithContext(RequestContextSnapshot snapshot, Callable<T> callable) throws Exception {
        Objects.requireNonNull(callable, "callable");
        RequestContextSnapshot previous = requestContext.snapshot();
        try {
            requestContext.restore(snapshot);
            return callable.call();
        } finally {
            if (previous != null) {
                requestContext.restore(previous);
            } else {
                requestContext.clear();
            }
        }
    }

    /**
     * 包装当前上下文到 Callable。
     */
    public <T> Callable<T> wrapCurrentContext(Callable<T> callable) {
        RequestContextSnapshot snapshot = capture();
        return () -> callWithContext(snapshot, callable);
    }
}
