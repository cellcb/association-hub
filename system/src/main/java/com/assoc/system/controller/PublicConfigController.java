package com.assoc.system.controller;

import com.assoc.common.Result;
import com.assoc.system.service.ConfigService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/public/configs")
@RequiredArgsConstructor
@Tag(name = "公开配置接口", description = "前台获取网站配置（无需认证）")
public class PublicConfigController {

    private final ConfigService configService;

    @GetMapping("/site")
    @Operation(summary = "获取网站配置", description = "获取所有启用的网站配置，用于前台展示")
    public Result<Map<String, Object>> getSiteConfig() {
        return Result.success(configService.getSiteConfig());
    }
}
