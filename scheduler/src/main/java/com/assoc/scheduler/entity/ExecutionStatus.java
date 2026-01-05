package com.assoc.scheduler.entity;

/**
 * Result status recorded for each job execution attempt.
 */
public enum ExecutionStatus {
    SUCCESS,
    FAILED,
    SKIPPED,
    RETRIED
}
