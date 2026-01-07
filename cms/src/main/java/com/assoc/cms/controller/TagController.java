package com.assoc.cms.controller;

import com.assoc.cms.dto.TagResponse;
import com.assoc.cms.service.TagService;
import com.assoc.common.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "标签", description = "标签公开接口")
@RestController
@RequestMapping("/api/tags")
@RequiredArgsConstructor
public class TagController {

    private final TagService tagService;

    @Operation(summary = "获取所有标签")
    @GetMapping
    public Result<List<TagResponse>> getTags() {
        return Result.success(tagService.getAllTags());
    }

    @Operation(summary = "创建标签")
    @PostMapping
    public Result<TagResponse> createTag(@RequestBody TagRequest request) {
        return Result.success(tagService.getOrCreateByName(request.getName()));
    }

    @lombok.Data
    public static class TagRequest {
        private String name;
    }
}
