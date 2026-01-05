package com.assoc.scheduler.entity;

/**
 * High-level scheduling templates (WHEN). All templates eventually generate a cron expression.
 */
public enum ScheduleType {
    /**
     * Exact cron expression provided by user (cronExpression field).
     */
    CRON,

    /**
     * Execute every N seconds/minutes (intervalSeconds field).
     */
    FIXED_RATE,

    /**
     * Execute at a fixed time every day (startTime captures hh:mm:ss).
     */
    DAILY,

    /**
     * Execute on specified days of week at given time (daysOfWeek + startTime).
     */
    WEEKLY
}
