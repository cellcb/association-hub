package com.assoc.iam.exception;

import com.assoc.common.exception.BusinessException;

public class AuthenticationException extends BusinessException {
    
    public AuthenticationException(String message) {
        super(401, message);
    }
    
    public AuthenticationException(String message, Throwable cause) {
        super(401, message, cause);
    }
}
