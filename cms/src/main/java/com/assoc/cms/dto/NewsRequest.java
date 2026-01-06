package com.assoc.cms.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class NewsRequest {
    @NotBlank(message = "标题不能为空")
    private String title;

    private String excerpt;

    @NotBlank(message = "内容不能为空")
    private String content;

    @NotNull(message = "分类不能为空")
    private Long categoryId;

    private String author;
    private String coverImage;
    private Boolean featured;
    private Integer status;
    private List<Long> tagIds;
}
