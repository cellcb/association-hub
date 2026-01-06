package com.assoc.cms.service.impl;

import com.assoc.cms.dto.CommentRequest;
import com.assoc.cms.dto.CommentResponse;
import com.assoc.cms.entity.Comment;
import com.assoc.cms.entity.ResourceType;
import com.assoc.cms.repository.CommentRepository;
import com.assoc.cms.service.CommentService;
import com.assoc.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CommentServiceImpl implements CommentService {

    private final CommentRepository commentRepository;

    private static final int STATUS_ACTIVE = 1;

    @Override
    public Page<CommentResponse> getComments(ResourceType resourceType, Long resourceId, Pageable pageable) {
        return commentRepository.findByResourceTypeAndResourceIdAndParentIdIsNullAndStatus(
                        resourceType, resourceId, STATUS_ACTIVE, pageable)
                .map(this::toResponseWithReplies);
    }

    @Override
    @Transactional
    public CommentResponse addComment(ResourceType resourceType, Long resourceId, CommentRequest request, Long authorId) {
        Comment comment = new Comment();
        comment.setResourceType(resourceType);
        comment.setResourceId(resourceId);
        comment.setContent(request.getContent());
        comment.setAuthorId(authorId);
        comment.setAuthorName(request.getAuthorName());
        comment.setLikes(0);
        comment.setStatus(STATUS_ACTIVE);

        comment = commentRepository.save(comment);
        return toResponse(comment);
    }

    @Override
    @Transactional
    public CommentResponse replyComment(Long parentId, CommentRequest request, Long authorId) {
        Comment parent = commentRepository.findById(parentId)
                .orElseThrow(() -> new ResourceNotFoundException("评论不存在: " + parentId));

        Comment reply = new Comment();
        reply.setResourceType(parent.getResourceType());
        reply.setResourceId(parent.getResourceId());
        reply.setParentId(parentId);
        reply.setContent(request.getContent());
        reply.setAuthorId(authorId);
        reply.setAuthorName(request.getAuthorName());
        reply.setLikes(0);
        reply.setStatus(STATUS_ACTIVE);

        reply = commentRepository.save(reply);
        return toResponse(reply);
    }

    @Override
    @Transactional
    public void incrementLikes(Long id) {
        commentRepository.incrementLikes(id);
    }

    @Override
    public long countComments(ResourceType resourceType, Long resourceId) {
        return commentRepository.countByResourceTypeAndResourceIdAndStatus(resourceType, resourceId, STATUS_ACTIVE);
    }

    @Override
    @Transactional
    public void deleteComment(Long id) {
        if (!commentRepository.existsById(id)) {
            throw new ResourceNotFoundException("评论不存在: " + id);
        }
        commentRepository.deleteById(id);
    }

    @Override
    @Transactional
    public void deleteCommentsByResource(ResourceType resourceType, Long resourceId) {
        commentRepository.deleteByResourceTypeAndResourceId(resourceType, resourceId);
    }

    private CommentResponse toResponse(Comment comment) {
        CommentResponse response = new CommentResponse();
        response.setId(comment.getId());
        response.setContent(comment.getContent());
        response.setAuthorId(comment.getAuthorId());
        response.setAuthorName(comment.getAuthorName());
        response.setLikes(comment.getLikes());
        response.setStatus(comment.getStatus());
        response.setCreatedTime(comment.getCreatedTime());
        return response;
    }

    private CommentResponse toResponseWithReplies(Comment comment) {
        CommentResponse response = toResponse(comment);
        var replies = commentRepository.findByParentIdAndStatus(comment.getId(), STATUS_ACTIVE);
        if (replies != null && !replies.isEmpty()) {
            response.setReplies(replies.stream()
                    .map(this::toResponse)
                    .collect(Collectors.toList()));
        }
        return response;
    }
}
