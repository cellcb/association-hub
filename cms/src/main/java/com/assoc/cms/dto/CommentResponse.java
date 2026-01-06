package com.assoc.cms.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class CommentResponse {
    private Long id;
    private String content;
    private Long authorId;
    private String authorName;
    private Integer likes;
    private Integer status;
    private LocalDateTime createdTime;
    private List<CommentResponse> replies;
}
