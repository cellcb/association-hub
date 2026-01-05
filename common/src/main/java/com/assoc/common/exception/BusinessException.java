package com.assoc.common.exception;

/**
 * 业务异常基类
 * 用于表示业务逻辑处理过程中的异常情况
 */
public class BusinessException extends RuntimeException {
    
    private int code;
    
    public BusinessException(String message) {
        super(message);
        this.code = 400; // 默认业务异常代码
    }
    
    public BusinessException(int code, String message) {
        super(message);
        this.code = code;
    }
    
    public BusinessException(String message, Throwable cause) {
        super(message, cause);
        this.code = 400;
    }
    
    public BusinessException(int code, String message, Throwable cause) {
        super(message, cause);
        this.code = code;
    }
    
    public int getCode() {
        return code;
    }
}
