package com.assoc.iam.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class DepartmentResponse {
    
    private Long id;
    
    private String name;
    
    private String code;
    
    private String description;
    
    private Long parentId;
    
    private String parentName;
    
    private Integer sortOrder;
    
    private Integer level;
    
    private String path;
    
    private Integer status;
    
    private LocalDateTime createdTime;
    
    private LocalDateTime updatedTime;
    
    private Long createdBy;
    
    private Long updatedBy;
    
    private List<DepartmentResponse> children;
    
    private Integer userCount;
    
    private boolean hasChildren;
}
