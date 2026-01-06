package com.assoc.cms.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class NewsResponse {
    private Long id;
    private String title;
    private String excerpt;
    private String content;
    private NewsCategoryResponse category;
    private String author;
    private String coverImage;
    private Integer views;
    private Integer likes;
    private Boolean featured;
    private Integer status;
    private LocalDateTime publishedAt;
    private LocalDateTime createdTime;
    private LocalDateTime updatedTime;
    private List<TagResponse> tags;
}
