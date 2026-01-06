package com.assoc.cms.controller;

import com.assoc.cms.dto.NewsListResponse;
import com.assoc.cms.dto.NewsRequest;
import com.assoc.cms.dto.NewsResponse;
import com.assoc.cms.service.NewsService;
import com.assoc.common.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;

@Tag(name = "新闻管理", description = "新闻管理后台接口")
@RestController
@RequestMapping("/api/admin/news")
@RequiredArgsConstructor
public class AdminNewsController {

    private final NewsService newsService;

    @Operation(summary = "获取新闻列表")
    @GetMapping
    public Result<Page<NewsListResponse>> getNews(
            @Parameter(description = "状态") @RequestParam(required = false) Integer status,
            @Parameter(description = "分类ID") @RequestParam(required = false) Long categoryId,
            @PageableDefault(sort = "createdTime", direction = Sort.Direction.DESC) Pageable pageable) {
        return Result.success(newsService.getAllNews(status, categoryId, pageable));
    }

    @Operation(summary = "获取新闻详情")
    @GetMapping("/{id}")
    public Result<NewsResponse> getNewsById(@PathVariable Long id) {
        return Result.success(newsService.getNewsById(id));
    }

    @Operation(summary = "创建新闻")
    @PostMapping
    public Result<NewsResponse> createNews(@Valid @RequestBody NewsRequest request) {
        return Result.success(newsService.createNews(request));
    }

    @Operation(summary = "更新新闻")
    @PutMapping("/{id}")
    public Result<NewsResponse> updateNews(@PathVariable Long id, @Valid @RequestBody NewsRequest request) {
        return Result.success(newsService.updateNews(id, request));
    }

    @Operation(summary = "删除新闻")
    @DeleteMapping("/{id}")
    public Result<Void> deleteNews(@PathVariable Long id) {
        newsService.deleteNews(id);
        return Result.success(null);
    }

    @Operation(summary = "发布新闻")
    @PostMapping("/{id}/publish")
    public Result<Void> publishNews(@PathVariable Long id) {
        newsService.publishNews(id);
        return Result.success(null);
    }

    @Operation(summary = "取消发布")
    @PostMapping("/{id}/unpublish")
    public Result<Void> unpublishNews(@PathVariable Long id) {
        newsService.unpublishNews(id);
        return Result.success(null);
    }
}
