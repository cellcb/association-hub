package com.assoc.cms.service;

import com.assoc.cms.dto.CommentRequest;
import com.assoc.cms.dto.CommentResponse;
import com.assoc.cms.entity.ResourceType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CommentService {

    Page<CommentResponse> getComments(ResourceType resourceType, Long resourceId, Pageable pageable);

    CommentResponse addComment(ResourceType resourceType, Long resourceId, CommentRequest request, Long authorId);

    CommentResponse replyComment(Long parentId, CommentRequest request, Long authorId);

    void incrementLikes(Long id);

    long countComments(ResourceType resourceType, Long resourceId);

    // Admin methods
    void deleteComment(Long id);

    void deleteCommentsByResource(ResourceType resourceType, Long resourceId);
}
