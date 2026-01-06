package com.assoc.cms.controller;

import com.assoc.cms.dto.ExpertiseFieldResponse;
import com.assoc.cms.service.ExpertiseFieldService;
import com.assoc.common.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "专业领域", description = "专业领域公开接口")
@RestController
@RequestMapping("/api/expertise-fields")
@RequiredArgsConstructor
public class ExpertiseFieldController {

    private final ExpertiseFieldService expertiseFieldService;

    @Operation(summary = "获取所有有效专业领域")
    @GetMapping
    public Result<List<ExpertiseFieldResponse>> getFields() {
        return Result.success(expertiseFieldService.getActiveFields());
    }
}
