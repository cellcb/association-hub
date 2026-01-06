package com.assoc.cms.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class NewsListResponse {
    private Long id;
    private String title;
    private String excerpt;
    private String categoryName;
    private Long categoryId;
    private String author;
    private String coverImage;
    private Integer views;
    private Integer likes;
    private Boolean featured;
    private Integer status;
    private LocalDateTime publishedAt;
    private List<TagResponse> tags;
}
