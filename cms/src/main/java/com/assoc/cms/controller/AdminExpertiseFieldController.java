package com.assoc.cms.controller;

import com.assoc.cms.dto.ExpertiseFieldRequest;
import com.assoc.cms.dto.ExpertiseFieldResponse;
import com.assoc.cms.service.ExpertiseFieldService;
import com.assoc.common.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "专业领域管理", description = "专业领域管理后台接口")
@RestController
@RequestMapping("/api/admin/expertise-fields")
@RequiredArgsConstructor
public class AdminExpertiseFieldController {

    private final ExpertiseFieldService expertiseFieldService;

    @Operation(summary = "获取领域列表")
    @GetMapping
    public Result<List<ExpertiseFieldResponse>> getFields() {
        return Result.success(expertiseFieldService.getAllFields());
    }

    @Operation(summary = "获取领域详情")
    @GetMapping("/{id}")
    public Result<ExpertiseFieldResponse> getFieldById(@PathVariable Long id) {
        return Result.success(expertiseFieldService.getById(id));
    }

    @Operation(summary = "创建领域")
    @PostMapping
    public Result<ExpertiseFieldResponse> createField(@Valid @RequestBody ExpertiseFieldRequest request) {
        return Result.success(expertiseFieldService.create(request));
    }

    @Operation(summary = "更新领域")
    @PutMapping("/{id}")
    public Result<ExpertiseFieldResponse> updateField(
            @PathVariable Long id,
            @Valid @RequestBody ExpertiseFieldRequest request) {
        return Result.success(expertiseFieldService.update(id, request));
    }

    @Operation(summary = "删除领域")
    @DeleteMapping("/{id}")
    public Result<Void> deleteField(@PathVariable Long id) {
        expertiseFieldService.delete(id);
        return Result.success(null);
    }
}
