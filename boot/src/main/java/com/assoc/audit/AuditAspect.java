package com.assoc.audit;

import com.assoc.common.audit.Audit;
import com.assoc.common.audit.AuditAction;
import com.assoc.common.audit.AuditContext;
import com.assoc.common.audit.AuditEvent;
import com.assoc.common.audit.AuditResultStatus;
import com.assoc.common.audit.ParameterMasker;
import com.assoc.common.context.RequestContext;
import com.assoc.iam.security.UserPrincipal;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.validation.BindingResult;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Slf4j
@Aspect
@Component
@RequiredArgsConstructor
public class AuditAspect {

    private final ApplicationEventPublisher eventPublisher;
    private final ParameterMasker parameterMasker;
    private final RequestContext requestContext;

    @Around("@annotation(audit)")
    public Object aroundAuditedMethod(ProceedingJoinPoint joinPoint, Audit audit) throws Throwable {
        OffsetDateTime start = OffsetDateTime.now();
        AuditContext.AuditContextBuilder builder = AuditContext.builder()
                .action(resolveAction(audit))
                .resource(audit.resource())
                .remark(audit.remark())
                .occurredAt(start);

        HttpServletRequest request = currentRequest();
        if (request != null) {
            builder.requestUri(request.getRequestURI());
            builder.httpMethod(request.getMethod());
            builder.clientIp(resolveClientIp(request));
            builder.userAgent(request.getHeader("User-Agent"));
        }

        builder.userId(requestContext.currentUserId().orElse(null));
        builder.username(requestContext.currentUsername().orElse(null));

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserPrincipal userPrincipal) {
            builder.roles(userPrincipal.getRoleCodes());
            builder.permissions(userPrincipal.getPermissionCodes());
        } else if (authentication != null && authentication.getAuthorities() != null) {
            List<String> permissions = authentication.getAuthorities().stream()
                    .map(Objects::toString)
                    .toList();
            builder.permissions(permissions);
        } else if (!requestContext.authorities().isEmpty()) {
            builder.permissions(new ArrayList<>(requestContext.authorities()));
        }

        Map<String, Object> params = collectArguments(joinPoint);
        if (audit.maskArgs() && !params.isEmpty()) {
            builder.parameters(parameterMasker.maskAndSerialize(params));
        }

        try {
            Object result = joinPoint.proceed();
            builder.resultStatus(AuditResultStatus.SUCCESS);
            return result;
        } catch (Throwable ex) {
            builder.resultStatus(AuditResultStatus.FAILURE);
            builder.resultMessage(ex.getMessage());
            throw ex;
        } finally {
            requestContext.currentUserId().ifPresent(builder::userId);
            requestContext.currentUsername().ifPresent(builder::username);
            builder.latencyMs(Duration.between(start, OffsetDateTime.now()).toMillis());
            eventPublisher.publishEvent(new AuditEvent(builder.build()));
        }
    }

    private String resolveAction(Audit audit) {
        if (StringUtils.hasText(audit.actionName())) {
            return audit.actionName();
        }
        AuditAction action = audit.action();
        return action != null ? action.getCode() : AuditAction.UNKNOWN.getCode();
    }

    private HttpServletRequest currentRequest() {
        RequestAttributes attrs = RequestContextHolder.getRequestAttributes();
        if (attrs instanceof ServletRequestAttributes servletRequestAttributes) {
            return servletRequestAttributes.getRequest();
        }
        return null;
    }

    private Map<String, Object> collectArguments(ProceedingJoinPoint joinPoint) {
        Map<String, Object> parameters = new LinkedHashMap<>();
        Object[] args = joinPoint.getArgs();
        String[] names = ((MethodSignature) joinPoint.getSignature()).getParameterNames();

        for (int i = 0; i < args.length; i++) {
            Object arg = args[i];
            if (shouldIgnoreArgument(arg)) {
                continue;
            }
            String name = (names != null && names.length > i && names[i] != null)
                    ? names[i]
                    : "arg" + i;
            parameters.put(name, simplify(arg));
        }
        return parameters;
    }

    private boolean shouldIgnoreArgument(Object arg) {
        return arg instanceof HttpServletRequest
                || arg instanceof ServletRequest
                || arg instanceof ServletResponse
                || arg instanceof BindingResult;
    }

    private Object simplify(Object arg) {
        if (arg == null) {
            return null;
        }
        if (arg instanceof MultipartFile file) {
            return "file:" + file.getOriginalFilename();
        }
        if (arg instanceof MultipartFile[] files) {
            List<String> fileNames = new ArrayList<>(files.length);
            for (MultipartFile file : files) {
                fileNames.add(file.getOriginalFilename());
            }
            return fileNames;
        }
        if (arg instanceof CharSequence || arg instanceof Number || arg instanceof Boolean) {
            return arg;
        }
        if (arg instanceof byte[]) {
            return "[binary]";
        }
        return arg;
    }

    private String resolveClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (StringUtils.hasText(forwarded)) {
            return forwarded.split(",")[0].trim();
        }
        String realIp = request.getHeader("X-Real-IP");
        if (StringUtils.hasText(realIp)) {
            return realIp.trim();
        }
        return request.getRemoteAddr();
    }
}
