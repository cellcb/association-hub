package com.assoc.system.controller;

import com.assoc.common.Result;
import com.assoc.system.dto.ConfigRequest;
import com.assoc.system.dto.ConfigResponse;
import com.assoc.system.dto.ConfigUpdateRequest;
import com.assoc.system.service.ConfigService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/configs")
@RequiredArgsConstructor
@Tag(name = "系统配置管理", description = "后台管理系统配置接口")
public class AdminConfigController {

    private final ConfigService configService;

    @GetMapping
    @Operation(summary = "获取所有配置", description = "分页获取所有配置项")
    public Result<Page<ConfigResponse>> getAll(
            @PageableDefault(size = 50) Pageable pageable) {
        return Result.success(configService.getAll(pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "获取配置详情", description = "根据ID获取配置详情")
    public Result<ConfigResponse> getById(@PathVariable Long id) {
        return Result.success(configService.getById(id));
    }

    @GetMapping("/key/{configKey}")
    @Operation(summary = "根据配置键获取", description = "根据配置键获取配置详情")
    public Result<ConfigResponse> getByKey(@PathVariable String configKey) {
        return Result.success(configService.getByKey(configKey));
    }

    @GetMapping("/category/{category}")
    @Operation(summary = "按分类获取配置", description = "获取指定分类的所有配置项")
    public Result<List<ConfigResponse>> getByCategory(@PathVariable String category) {
        return Result.success(configService.getAllByCategory(category));
    }

    @PostMapping
    @Operation(summary = "创建配置", description = "创建新的配置项")
    public Result<ConfigResponse> create(@Valid @RequestBody ConfigRequest request) {
        return Result.success(configService.create(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "更新配置", description = "更新配置项")
    public Result<ConfigResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody ConfigUpdateRequest request) {
        return Result.success(configService.update(id, request));
    }

    @PutMapping("/{id}/value")
    @Operation(summary = "更新配置值", description = "仅更新配置值")
    public Result<Void> updateValue(
            @PathVariable Long id,
            @RequestBody String value) {
        configService.updateValue(id, value);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "删除配置", description = "删除配置项")
    public Result<Void> delete(@PathVariable Long id) {
        configService.delete(id);
        return Result.success();
    }
}
