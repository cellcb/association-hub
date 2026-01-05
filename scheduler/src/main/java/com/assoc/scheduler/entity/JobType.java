package com.assoc.scheduler.entity;

/**
 * Types of jobs supported by the scheduler. Each type is handled by a dedicated JobHandler.
 */
public enum JobType {
    HTTP,
    COMMAND,
    INTERNAL_SERVICE
}
