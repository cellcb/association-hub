package com.assoc.cms.controller;

import com.assoc.cms.dto.NewsListResponse;
import com.assoc.cms.dto.NewsResponse;
import com.assoc.cms.service.NewsService;
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

@Tag(name = "新闻", description = "新闻公开接口")
@RestController
@RequestMapping("/api/news")
@RequiredArgsConstructor
public class NewsController {

    private final NewsService newsService;

    @Operation(summary = "获取新闻列表")
    @GetMapping
    public Result<Page<NewsListResponse>> getNews(
            @Parameter(description = "分类ID") @RequestParam(required = false) Long categoryId,
            @Parameter(description = "搜索关键词") @RequestParam(required = false) String keyword,
            @Parameter(description = "标签ID") @RequestParam(required = false) Long tagId,
            @Parameter(description = "是否推荐") @RequestParam(required = false) Boolean featured,
            @PageableDefault(sort = "publishedAt", direction = Sort.Direction.DESC) Pageable pageable) {

        Page<NewsListResponse> result;
        if (keyword != null && !keyword.isEmpty()) {
            result = newsService.searchNews(keyword, pageable);
        } else if (tagId != null) {
            result = newsService.getNewsByTag(tagId, pageable);
        } else if (categoryId != null) {
            result = newsService.getNewsByCategory(categoryId, pageable);
        } else if (Boolean.TRUE.equals(featured)) {
            result = newsService.getFeaturedNews(pageable);
        } else {
            result = newsService.getPublishedNews(pageable);
        }
        return Result.success(result);
    }

    @Operation(summary = "获取新闻详情")
    @GetMapping("/{id}")
    public Result<NewsResponse> getNewsById(@PathVariable Long id) {
        return Result.success(newsService.getNewsById(id));
    }

    @Operation(summary = "增加浏览量")
    @PostMapping("/{id}/view")
    public Result<Void> incrementViews(@PathVariable Long id) {
        newsService.incrementViews(id);
        return Result.success(null);
    }

    @Operation(summary = "点赞")
    @PostMapping("/{id}/like")
    public Result<Void> incrementLikes(@PathVariable Long id) {
        newsService.incrementLikes(id);
        return Result.success(null);
    }
}
