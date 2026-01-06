package com.assoc.member.controller;

import com.assoc.common.Result;
import com.assoc.member.dto.ApplicationStatusResponse;
import com.assoc.member.dto.MemberApplicationRequest;
import com.assoc.member.dto.MemberApplicationResponse;
import com.assoc.member.service.MemberApplicationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * Public member application controller
 * Handles member application submission and status queries
 */
@RestController
@RequestMapping("/api/members")
@RequiredArgsConstructor
@Tag(name = "Member Application", description = "Public member application APIs")
public class MemberApplicationController {

    private final MemberApplicationService applicationService;

    @PostMapping("/apply")
    @Operation(summary = "Submit member application", description = "Submit a new member application with account credentials")
    public Result<MemberApplicationResponse> submitApplication(@Valid @RequestBody MemberApplicationRequest request) {
        MemberApplicationResponse response = applicationService.submitApplication(request);
        return Result.success("Application submitted successfully", response);
    }

    @GetMapping("/check-username")
    @Operation(summary = "Check username availability", description = "Check if a username is available for registration")
    public Result<Boolean> checkUsername(@RequestParam String username) {
        boolean available = applicationService.isUsernameAvailable(username);
        return Result.success(available);
    }

    @GetMapping("/check-email")
    @Operation(summary = "Check email availability", description = "Check if an email is available for registration")
    public Result<Boolean> checkEmail(@RequestParam String email) {
        boolean available = applicationService.isEmailAvailable(email);
        return Result.success(available);
    }

    @GetMapping("/application/{id}/status")
    @Operation(summary = "Get application status", description = "Query the status of a member application")
    public Result<ApplicationStatusResponse> getApplicationStatus(@PathVariable Long id) {
        ApplicationStatusResponse response = applicationService.getApplicationStatus(id);
        return Result.success(response);
    }
}
