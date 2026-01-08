package com.assoc.iam.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Schema(description = "用户个人档案响应信息")
public class UserProfileResponse {

    @Schema(description = "用户ID", example = "1")
    private Long id;

    @Schema(description = "用户名", example = "zhangsan")
    private String username;

    @Schema(description = "邮箱", example = "zhangsan@example.com")
    private String email;

    @Schema(description = "手机号", example = "13800138000")
    private String phone;

    @Schema(description = "真实姓名", example = "张三")
    private String realName;

    @Schema(description = "最后登录时间")
    private LocalDateTime lastLoginTime;

    @Schema(description = "创建时间")
    private LocalDateTime createdTime;

    @Schema(description = "部门名称")
    private String departmentName;

    @Schema(description = "角色名称列表")
    private List<String> roleNames;

    @Schema(description = "会员档案信息（如果是活跃会员）")
    private MemberProfile memberProfile;

    @Data
    @Schema(description = "会员档案信息")
    public static class MemberProfile {
        @Schema(description = "会员ID")
        private Long memberId;

        @Schema(description = "会员编号")
        private String memberNo;

        @Schema(description = "会员类型", example = "INDIVIDUAL")
        private String memberType;

        @Schema(description = "会员状态", example = "ACTIVE")
        private String memberStatus;

        @Schema(description = "姓名/联系人")
        private String name;

        @Schema(description = "电话")
        private String phone;

        @Schema(description = "邮箱")
        private String email;

        @Schema(description = "公司/组织名称")
        private String company;

        @Schema(description = "职位")
        private String position;
    }
}
