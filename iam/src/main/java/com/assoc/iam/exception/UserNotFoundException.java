package com.assoc.iam.exception;

import com.assoc.common.exception.BusinessException;

/**
 * 用户不存在异常
 */
public class UserNotFoundException extends BusinessException {
    
    public UserNotFoundException(String message) {
        super(404, message);
    }
    
    public UserNotFoundException(Long userId) {
        super(404, "用户不存在: " + userId);
    }
    
    public UserNotFoundException(String message, Throwable cause) {
        super(404, message, cause);
    }
}
