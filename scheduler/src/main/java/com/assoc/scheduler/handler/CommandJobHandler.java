package com.assoc.scheduler.handler;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.assoc.scheduler.entity.JobType;
import com.assoc.scheduler.entity.SchedulerJob;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.quartz.JobExecutionContext;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

/**
 * Executes arbitrary shell commands. Security validations should be applied before production use.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class CommandJobHandler implements JobHandler {

    private final ObjectMapper objectMapper;

    @Override
    public JobType getType() {
        return JobType.COMMAND;
    }

    @Override
    public void handle(SchedulerJob job, JobExecutionContext context) throws Exception {
        CommandJobConfig config = objectMapper.readValue(job.getJobConfig(), CommandJobConfig.class);
        if (!StringUtils.hasText(config.getCommand())) {
            throw new IllegalArgumentException("命令作业缺少 command");
        }
        ProcessBuilder builder = new ProcessBuilder("bash", "-lc", config.getCommand());
        if (StringUtils.hasText(config.getWorkingDirectory())) {
            builder.directory(new File(config.getWorkingDirectory()));
        }
        if (config.getEnvironment() != null) {
            builder.environment().putAll(config.getEnvironment());
        }
        Process process = builder.start();
        Duration timeout = Duration.ofSeconds(Math.max(1, config.getTimeoutSeconds()));
        boolean finished = process.waitFor(timeout.toMillis(), TimeUnit.MILLISECONDS);
        if (!finished) {
            process.destroyForcibly();
            throw new IllegalStateException("命令执行超时");
        }
        int exitCode = process.exitValue();
        String stdout = new BufferedReader(new InputStreamReader(process.getInputStream()))
                .lines().collect(Collectors.joining("\n"));
        String stderr = new BufferedReader(new InputStreamReader(process.getErrorStream()))
                .lines().collect(Collectors.joining("\n"));
        log.info("命令作业完成 jobId={}, exitCode={}, stdout={}, stderr={}", job.getId(), exitCode, stdout, stderr);
        if (exitCode != 0) {
            throw new IllegalStateException("命令执行失败，exitCode=" + exitCode + ", stderr=" + stderr);
        }
    }

    @Data
    private static class CommandJobConfig {
        private String command;
        private String workingDirectory;
        private Map<String, String> environment;
        private int timeoutSeconds = 60;
    }
}
