package com.assoc.member.controller;

import com.assoc.common.Result;
import com.assoc.iam.security.UserPrincipal;
import com.assoc.member.dto.IndividualMemberUpdateRequest;
import com.assoc.member.dto.MemberResponse;
import com.assoc.member.dto.OrganizationMemberUpdateRequest;
import com.assoc.member.entity.Member;
import com.assoc.member.entity.MemberType;
import com.assoc.member.repository.MemberRepository;
import com.assoc.member.service.MemberService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * Member self-service controller
 * Allows logged-in users to view and update their own member profile
 */
@Slf4j
@RestController
@RequestMapping("/api/members/me")
@RequiredArgsConstructor
@Tag(name = "会员个人档案", description = "会员自服务接口，用于查看和更新自己的会员信息")
@SecurityRequirement(name = "Bearer Authentication")
public class MemberProfileController {

    private final MemberService memberService;
    private final MemberRepository memberRepository;

    @GetMapping
    @Operation(summary = "获取我的会员信息", description = "获取当前登录用户的完整会员信息")
    public Result<MemberResponse> getMyProfile(@AuthenticationPrincipal UserPrincipal principal) {
        Long userId = principal.getId();
        log.info("Getting member profile for user: {}", userId);

        MemberResponse response = memberService.getMemberByUserId(userId);
        return Result.success(response);
    }

    @PutMapping("/individual")
    @Operation(summary = "更新个人会员信息", description = "更新当前登录用户的个人会员信息")
    public Result<MemberResponse> updateMyIndividualProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody IndividualMemberUpdateRequest request) {

        Long userId = principal.getId();
        log.info("Updating individual member profile for user: {}", userId);

        // Find the member by userId and verify it's an individual member
        Member member = memberRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("您不是会员，无法更新会员信息"));

        if (member.getMemberType() != MemberType.INDIVIDUAL) {
            throw new IllegalArgumentException("您不是个人会员，无法使用此接口更新信息");
        }

        MemberResponse response = memberService.updateIndividualMember(member.getId(), request);
        return Result.success("更新成功", response);
    }

    @PutMapping("/organization")
    @Operation(summary = "更新单位会员信息", description = "更新当前登录用户的单位会员信息")
    public Result<MemberResponse> updateMyOrganizationProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody OrganizationMemberUpdateRequest request) {

        Long userId = principal.getId();
        log.info("Updating organization member profile for user: {}", userId);

        // Find the member by userId and verify it's an organization member
        Member member = memberRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("您不是会员，无法更新会员信息"));

        if (member.getMemberType() != MemberType.ORGANIZATION) {
            throw new IllegalArgumentException("您不是单位会员，无法使用此接口更新信息");
        }

        MemberResponse response = memberService.updateOrganizationMember(member.getId(), request);
        return Result.success("更新成功", response);
    }
}
