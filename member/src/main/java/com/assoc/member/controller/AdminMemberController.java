package com.assoc.member.controller;

import com.assoc.common.Result;
import com.assoc.member.dto.*;
import com.assoc.member.entity.ApplicationStatus;
import com.assoc.member.entity.MemberStatus;
import com.assoc.member.entity.MemberType;
import com.assoc.member.service.MemberApplicationService;
import com.assoc.member.service.MemberService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;

/**
 * Admin member management controller
 * Handles member and application management for administrators
 */
@RestController
@RequestMapping("/api/admin/members")
@RequiredArgsConstructor
@Tag(name = "Admin Member Management", description = "Admin member management APIs")
public class AdminMemberController {

    private final MemberService memberService;
    private final MemberApplicationService applicationService;

    // ==================== Member Management ====================

    @GetMapping
    @Operation(summary = "Get all members", description = "Get paginated list of all members")
    public Result<Page<MemberResponse>> getAllMembers(
            @PageableDefault(size = 20, sort = "createdTime") Pageable pageable) {
        return Result.success(memberService.getAllMembers(pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get member by ID", description = "Get member details by ID")
    public Result<MemberResponse> getMemberById(@PathVariable Long id) {
        return Result.success(memberService.getMemberById(id));
    }

    @GetMapping("/by-user/{userId}")
    @Operation(summary = "Get member by user ID", description = "Get member details by user ID")
    public Result<MemberResponse> getMemberByUserId(@PathVariable Long userId) {
        return Result.success(memberService.getMemberByUserId(userId));
    }

    @GetMapping("/by-no/{memberNo}")
    @Operation(summary = "Get member by member number", description = "Get member details by member number")
    public Result<MemberResponse> getMemberByMemberNo(@PathVariable String memberNo) {
        return Result.success(memberService.getMemberByMemberNo(memberNo));
    }

    @GetMapping("/search")
    @Operation(summary = "Search members", description = "Search members by keyword")
    public Result<Page<MemberResponse>> searchMembers(
            @RequestParam String keyword,
            @PageableDefault(size = 20, sort = "createdTime") Pageable pageable) {
        return Result.success(memberService.searchMembers(keyword, pageable));
    }

    @GetMapping("/by-status/{status}")
    @Operation(summary = "Get members by status", description = "Get members filtered by status")
    public Result<Page<MemberResponse>> getMembersByStatus(
            @PathVariable MemberStatus status,
            @PageableDefault(size = 20, sort = "createdTime") Pageable pageable) {
        return Result.success(memberService.getMembersByStatus(status, pageable));
    }

    @GetMapping("/by-type/{type}")
    @Operation(summary = "Get members by type", description = "Get members filtered by type")
    public Result<Page<MemberResponse>> getMembersByType(
            @PathVariable MemberType type,
            @PageableDefault(size = 20, sort = "createdTime") Pageable pageable) {
        return Result.success(memberService.getMembersByType(type, pageable));
    }

    @PutMapping("/{id}/individual")
    @Operation(summary = "Update individual member", description = "Update individual member details")
    public Result<MemberResponse> updateIndividualMember(
            @PathVariable Long id,
            @Valid @RequestBody IndividualMemberUpdateRequest request) {
        return Result.success(memberService.updateIndividualMember(id, request));
    }

    @PutMapping("/{id}/organization")
    @Operation(summary = "Update organization member", description = "Update organization member details")
    public Result<MemberResponse> updateOrganizationMember(
            @PathVariable Long id,
            @Valid @RequestBody OrganizationMemberUpdateRequest request) {
        return Result.success(memberService.updateOrganizationMember(id, request));
    }

    @PostMapping("/{id}/suspend")
    @Operation(summary = "Suspend member", description = "Suspend a member")
    public Result<Void> suspendMember(@PathVariable Long id) {
        memberService.suspendMember(id);
        return Result.success("Member suspended successfully", null);
    }

    @PostMapping("/{id}/activate")
    @Operation(summary = "Activate member", description = "Activate a member")
    public Result<Void> activateMember(@PathVariable Long id) {
        memberService.activateMember(id);
        return Result.success("Member activated successfully", null);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete member", description = "Delete a member")
    public Result<Void> deleteMember(@PathVariable Long id) {
        memberService.deleteMember(id);
        return Result.success("Member deleted successfully", null);
    }

    @GetMapping("/stats")
    @Operation(summary = "Get member statistics", description = "Get member statistics")
    public Result<MemberStatsResponse> getStatistics() {
        return Result.success(memberService.getStatistics());
    }

    // ==================== Application Management ====================

    @GetMapping("/applications")
    @Operation(summary = "Get all applications", description = "Get paginated list of all applications")
    public Result<Page<MemberApplicationResponse>> getAllApplications(
            @PageableDefault(size = 20, sort = "createdTime") Pageable pageable) {
        return Result.success(applicationService.getAllApplications(pageable));
    }

    @GetMapping("/applications/{id}")
    @Operation(summary = "Get application by ID", description = "Get application details by ID")
    public Result<MemberApplicationResponse> getApplicationById(@PathVariable Long id) {
        return Result.success(applicationService.getApplicationById(id));
    }

    @GetMapping("/applications/search")
    @Operation(summary = "Search applications", description = "Search applications by keyword")
    public Result<Page<MemberApplicationResponse>> searchApplications(
            @RequestParam String keyword,
            @PageableDefault(size = 20, sort = "createdTime") Pageable pageable) {
        return Result.success(applicationService.searchApplications(keyword, pageable));
    }

    @GetMapping("/applications/by-status/{status}")
    @Operation(summary = "Get applications by status", description = "Get applications filtered by status")
    public Result<Page<MemberApplicationResponse>> getApplicationsByStatus(
            @PathVariable ApplicationStatus status,
            @PageableDefault(size = 20, sort = "createdTime") Pageable pageable) {
        return Result.success(applicationService.getApplicationsByStatus(status, pageable));
    }

    @GetMapping("/applications/by-type/{type}")
    @Operation(summary = "Get applications by member type", description = "Get applications filtered by member type")
    public Result<Page<MemberApplicationResponse>> getApplicationsByMemberType(
            @PathVariable MemberType type,
            @PageableDefault(size = 20, sort = "createdTime") Pageable pageable) {
        return Result.success(applicationService.getApplicationsByMemberType(type, pageable));
    }

    @PostMapping("/applications/{id}/approve")
    @Operation(summary = "Approve application", description = "Approve a member application and create user account")
    public Result<MemberResponse> approveApplication(@PathVariable Long id) {
        MemberResponse response = applicationService.approveApplication(id);
        return Result.success("Application approved successfully", response);
    }

    @PostMapping("/applications/{id}/reject")
    @Operation(summary = "Reject application", description = "Reject a member application")
    public Result<Void> rejectApplication(
            @PathVariable Long id,
            @RequestParam(required = false) String reason) {
        applicationService.rejectApplication(id, reason);
        return Result.success("Application rejected successfully", null);
    }
}
