package com.assoc.cms.controller;

import com.assoc.cms.dto.ExpertListResponse;
import com.assoc.cms.dto.ExpertResponse;
import com.assoc.cms.service.ExpertService;
import com.assoc.common.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;

@Tag(name = "专家", description = "专家公开接口")
@RestController
@RequestMapping("/api/experts")
@RequiredArgsConstructor
public class ExpertController {

    private final ExpertService expertService;

    @Operation(summary = "获取专家列表")
    @GetMapping
    public Result<Page<ExpertListResponse>> getExperts(
            @Parameter(description = "搜索关键词") @RequestParam(required = false) String keyword,
            @Parameter(description = "专业领域ID") @RequestParam(required = false) Long fieldId,
            @Parameter(description = "专业领域代码") @RequestParam(required = false) String fieldCode,
            @PageableDefault(sort = "createdTime", direction = Sort.Direction.DESC) Pageable pageable) {

        Page<ExpertListResponse> result;
        if (keyword != null && !keyword.isEmpty()) {
            result = expertService.searchExperts(keyword, pageable);
        } else if (fieldId != null) {
            result = expertService.getExpertsByField(fieldId, pageable);
        } else if (fieldCode != null && !fieldCode.isEmpty()) {
            result = expertService.getExpertsByFieldCode(fieldCode, pageable);
        } else {
            result = expertService.getActiveExperts(pageable);
        }
        return Result.success(result);
    }

    @Operation(summary = "获取专家详情")
    @GetMapping("/{id}")
    public Result<ExpertResponse> getExpertById(@PathVariable Long id) {
        return Result.success(expertService.getExpertById(id));
    }
}
