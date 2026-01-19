package com.assoc.cms.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class NewsRequest {
    @NotBlank(message = "标题不能为空")
    @Size(max = 200, message = "标题不能超过200个字符")
    private String title;

    @Size(max = 500, message = "摘要不能超过500个字符")
    private String excerpt;

    @NotBlank(message = "内容不能为空")
    private String content;

    @NotNull(message = "分类不能为空")
    private Long categoryId;

    @Size(max = 50, message = "作者名称不能超过50个字符")
    private String author;
    private String coverImage;
    private Boolean featured;
    private Integer status;
    private List<Long> tagIds;
}
