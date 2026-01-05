package com.assoc.iam.dto;

import lombok.Data;

import java.util.List;

@Data
public class DepartmentTreeResponse {
    
    private Long id;
    
    private String name;
    
    private String code;
    
    private String description;
    
    private Long parentId;
    
    private Integer sortOrder;
    
    private Integer level;
    
    private Integer status;
    
    private List<DepartmentTreeResponse> children;
    
    private Integer userCount;
    
    private boolean hasChildren;
    
    private boolean expanded = false;
}
