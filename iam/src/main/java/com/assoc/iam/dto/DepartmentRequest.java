package com.assoc.iam.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class DepartmentRequest {
    
    @NotBlank(message = "部门名称不能为空")
    @Size(max = 100, message = "部门名称长度不能超过100个字符")
    private String name;
    
    @NotBlank(message = "部门编码不能为空")
    @Size(max = 50, message = "部门编码长度不能超过50个字符")
    private String code;
    
    @Size(max = 500, message = "部门描述长度不能超过500个字符")
    private String description;
    
    private Long parentId;
    
    private Integer sortOrder = 0;
    
    private Integer status = 1;
}
