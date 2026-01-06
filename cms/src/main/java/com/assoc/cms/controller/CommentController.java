package com.assoc.cms.controller;

import com.assoc.cms.dto.CommentRequest;
import com.assoc.cms.dto.CommentResponse;
import com.assoc.cms.entity.ResourceType;
import com.assoc.cms.service.CommentService;
import com.assoc.common.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;

@Tag(name = "评论", description = "评论公开接口")
@RestController
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @Operation(summary = "获取新闻评论")
    @GetMapping("/api/news/{newsId}/comments")
    public Result<Page<CommentResponse>> getNewsComments(
            @PathVariable Long newsId,
            @PageableDefault(sort = "createdTime", direction = Sort.Direction.DESC) Pageable pageable) {
        return Result.success(commentService.getComments(ResourceType.NEWS, newsId, pageable));
    }

    @Operation(summary = "发表新闻评论")
    @PostMapping("/api/news/{newsId}/comments")
    public Result<CommentResponse> addNewsComment(
            @PathVariable Long newsId,
            @Valid @RequestBody CommentRequest request) {
        // TODO: get authorId from security context
        return Result.success(commentService.addComment(ResourceType.NEWS, newsId, request, null));
    }

    @Operation(summary = "获取项目评论")
    @GetMapping("/api/projects/{projectId}/comments")
    public Result<Page<CommentResponse>> getProjectComments(
            @PathVariable Long projectId,
            @PageableDefault(sort = "createdTime", direction = Sort.Direction.DESC) Pageable pageable) {
        return Result.success(commentService.getComments(ResourceType.PROJECT, projectId, pageable));
    }

    @Operation(summary = "发表项目评论")
    @PostMapping("/api/projects/{projectId}/comments")
    public Result<CommentResponse> addProjectComment(
            @PathVariable Long projectId,
            @Valid @RequestBody CommentRequest request) {
        return Result.success(commentService.addComment(ResourceType.PROJECT, projectId, request, null));
    }

    @Operation(summary = "回复评论")
    @PostMapping("/api/comments/{commentId}/reply")
    public Result<CommentResponse> replyComment(
            @PathVariable Long commentId,
            @Valid @RequestBody CommentRequest request) {
        return Result.success(commentService.replyComment(commentId, request, null));
    }

    @Operation(summary = "点赞评论")
    @PostMapping("/api/comments/{commentId}/like")
    public Result<Void> likeComment(@PathVariable Long commentId) {
        commentService.incrementLikes(commentId);
        return Result.success(null);
    }
}
