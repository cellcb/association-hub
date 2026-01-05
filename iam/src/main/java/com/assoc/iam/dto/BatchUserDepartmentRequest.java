package com.assoc.iam.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
@Schema(description = "批量用户部门关系请求")
public class BatchUserDepartmentRequest {
    
    @Schema(description = "用户部门关系列表", required = true)
    @NotEmpty(message = "用户部门关系列表不能为空")
    @Valid
    private List<UserDepartmentRequest> relationships;
    
    @Schema(description = "是否覆盖现有关系", example = "false")
    private Boolean overwrite = false;
    
    @Schema(description = "操作描述", example = "批量调整部门人员")
    private String description;
}
