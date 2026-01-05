package com.assoc.scheduler.handler;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.assoc.scheduler.entity.JobType;
import com.assoc.scheduler.entity.SchedulerJob;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.quartz.JobExecutionContext;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.*;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.util.Collections;
import java.util.Locale;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class HttpJobHandler implements JobHandler {

    private final ObjectMapper objectMapper;
    private final RestTemplateBuilder restTemplateBuilder;

    @Override
    public JobType getType() {
        return JobType.HTTP;
    }

    @Override
    public void handle(SchedulerJob job, JobExecutionContext context) throws Exception {
        HttpJobConfig config = objectMapper.readValue(job.getJobConfig(), HttpJobConfig.class);
        if (!StringUtils.hasText(config.getUrl())) {
            throw new IllegalArgumentException("HTTP 作业缺少 URL");
        }
        HttpMethod method = resolveMethod(config.getMethod());

        HttpHeaders headers = new HttpHeaders();
        if (!CollectionUtils.isEmpty(config.getHeaders())) {
            config.getHeaders().forEach(headers::add);
        }

        HttpEntity<String> entity = new HttpEntity<>(config.getBody(), headers);
        Duration timeout = Duration.ofSeconds(Math.max(1, config.getTimeoutSeconds()));
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout((int) timeout.toMillis());
        requestFactory.setReadTimeout((int) timeout.toMillis());
        RestTemplate restTemplate = restTemplateBuilder
                .requestFactory(() -> requestFactory)
                .build();

        ResponseEntity<String> response = restTemplate.exchange(config.getUrl(), method, entity, String.class);
        if (!response.getStatusCode().is2xxSuccessful()) {
            throw new IllegalStateException("HTTP 作业调用失败，状态码：" + response.getStatusCode().value());
        }
        log.info("HTTP 作业执行成功，jobId={}, status={}", job.getId(), response.getStatusCode().value());
    }

    @Data
    private static class HttpJobConfig {
        private String url;
        private String method = "POST";
        private Map<String, String> headers = Collections.emptyMap();
        private String body = "";
        private int timeoutSeconds = 30;
    }

    private HttpMethod resolveMethod(String method) {
        if (!StringUtils.hasText(method)) {
            return HttpMethod.POST;
        }
        try {
            return HttpMethod.valueOf(method.toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("不支持的 HTTP 方法：" + method, ex);
        }
    }
}
