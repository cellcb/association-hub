package com.assoc.iam.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "修改密码请求")
public class ChangePasswordRequest {
    
    @Schema(description = "旧密码", required = true)
    @NotBlank(message = "旧密码不能为空")
    private String oldPassword;
    
    @Schema(description = "新密码", required = true)
    @NotBlank(message = "新密码不能为空")
    @Size(min = 6, max = 100, message = "新密码长度必须在6-100字符之间")
    private String newPassword;
    
    @Schema(description = "确认新密码", required = true)
    @NotBlank(message = "确认密码不能为空")
    private String confirmPassword;
}
