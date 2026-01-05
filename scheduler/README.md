# Scheduler Module

This module adds a multi-tenant job scheduler with Quartz-backed execution.  
Key features:

1. **Schema**
   - Business tables (prefixed `sch_`):
     - `sch_job` – job definitions with type (`HTTP`, `COMMAND`, `INTERNAL_SERVICE`), JSON config, strategy reference, precondition placeholder, enable flag.
     - `sch_schedule_strategy` – reusable structured schedules with cron+structured fields.
     - `sch_schedule_excluded_date` – per-strategy excluded dates (holidays).
     - `sch_job_execution_log` – execution history with status, retries, timing, error message.
   - Quartz tables (`sch_qrtz_*`) for clustered JDBC store (created by Flyway script).
   - Flyway configuration: `SchedulerFlywayConfiguration` registers the module migrations and uses history table `sch_flyway_schema_history`.

2. **Execution Flow**
   - `SchedulerJobService` keeps Quartz JobDetail/Trigger definitions in sync with DB definitions per tenant.
   - `TenantAwareQuartzJob` restores `RequestContext` tenant before executing.
   - `SchedulerExecutionServiceImpl` loads job & strategy, checks excluded dates, dispatches handler, logs result, schedules retries (global defaults in `scheduler.retry.*`).
   - Default handlers: HTTP requests, shell command execution (security TODO), internal service handler with pluggable `InternalJobTask`s.

3. **REST APIs**
   - `ScheduleStrategyController` – CRUD for strategies and excluded dates.
   - `SchedulerJobController` – CRUD, enable/disable jobs.
   - `SchedulerLogController` – query execution logs (filter by job, status, time range).
   - All endpoints require tenant context and return `Result<?>`.

4. **Properties**
   - Quartz configured in `boot/application*.yml` for JDBC store, table prefix `sch_qrtz_`, clustering enabled.
   - Retry defaults via `scheduler.retry.max-attempts` and `scheduler.retry.interval`.
   - Flyway toggled via `modules.flyway.scheduler.*`.

5. **Tests**
   - `ScheduleStrategyServiceTest` covers cron generation.
   - `SchedulerExecutionServiceImplTest` covers success path and retry scheduling (uses mocks).
   - Full Maven test run in this environment requires Maven repo access (see README in repo root for running tests).

## Job Configuration Examples

Below are sample payloads for the three built-in job types when creating/updating via `/api/scheduler/jobs`.

```jsonc
// HTTP job: POST to internal callback
{
  "name": "调用回调接口",
  "jobType": "HTTP",
  "jobConfig": "{ \"url\": \"https://api.internal/callback\", \"method\": \"POST\", \"headers\": {\"X-API-Key\": \"abc\"}, \"body\": \"{\\\"tenantId\\\":1}\", \"timeoutSeconds\": 20 }",
  "scheduleStrategyId": 1,
  "enabled": true
}

// COMMAND job: run shell script (ensure command is safe)
{
  "name": "清理临时文件",
  "jobType": "COMMAND",
  "jobConfig": "{ \"command\": \"sh /opt/app/scripts/cleanup.sh\", \"workingDirectory\": \"/opt/app/scripts\", \"timeoutSeconds\": 120 }",
  "scheduleStrategyId": 2,
  "enabled": true
}

// INTERNAL_SERVICE job: invoke registered handler
{
  "name": "重新索引知识库",
  "jobType": "INTERNAL_SERVICE",
  "jobConfig": "{ \"handlerKey\": \"kbReindex\", \"parameters\": {\"batchSize\": 100} }",
  "scheduleStrategyId": 3,
  "enabled": true
}
```
