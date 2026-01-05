package com.assoc.common.audit;

import java.lang.annotation.*;

/**
 * Marks a controller or service method as auditable.
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface Audit {

    /**
     * Canonical action code. If {@link #actionName()} is provided, it takes precedence.
     */
    AuditAction action() default AuditAction.UNKNOWN;

    /**
     * Free-form action name when enum values are insufficient.
     */
    String actionName() default "";

    /**
     * Resource being operated on (e.g., user, tenant, rule).
     */
    String resource() default "";

    /**
     * Optional remark to describe the intent of the operation.
     */
    String remark() default "";

    /**
     * Whether to capture and mask arguments before persisting. Set to false to omit parameters.
     */
    boolean maskArgs() default true;
}
