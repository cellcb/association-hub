package com.assoc.iam.exception;

import com.assoc.common.exception.BusinessException;

/**
 * 用户已存在异常
 */
public class UserAlreadyExistsException extends BusinessException {
    
    public UserAlreadyExistsException(String message) {
        super(409, message);
    }
    
    public UserAlreadyExistsException(String field, String value) {
        super(409, String.format("用户%s已存在: %s", field, value));
    }
    
    public UserAlreadyExistsException(String message, Throwable cause) {
        super(409, message, cause);
    }
}
