package com.assoc.iam.exception;

import com.assoc.common.exception.BusinessException;

/**
 * 密码无效异常
 */
public class InvalidPasswordException extends BusinessException {
    
    public InvalidPasswordException(String message) {
        super(400, message);
    }
    
    public InvalidPasswordException(String message, Throwable cause) {
        super(400, message, cause);
    }
}
