package com.assoc.member.controller;

import com.assoc.common.Result;
import com.assoc.member.dto.ApplicationStatusResponse;
import com.assoc.member.dto.MemberApplicationRequest;
import com.assoc.member.dto.MemberResponse;
import com.assoc.member.service.MemberApplicationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

/**
 * Public member application controller
 * Handles member application submission and status queries
 */
@RestController
@RequestMapping("/api/members")
@RequiredArgsConstructor
@Validated
@Tag(name = "Member Application", description = "Public member application APIs")
public class MemberApplicationController {

    private final MemberApplicationService applicationService;

    @PostMapping("/apply")
    @Operation(summary = "Submit member application", description = "Submit a new member application with account credentials")
    public Result<MemberResponse> submitApplication(@Valid @RequestBody MemberApplicationRequest request) {
        MemberResponse response = applicationService.submitApplication(request);
        return Result.success("Application submitted successfully", response);
    }

    @GetMapping("/check-username")
    @Operation(summary = "Check username availability", description = "Check if a username is available for registration")
    public Result<Boolean> checkUsername(
            @RequestParam
            @NotBlank(message = "Username is required")
            @Size(min = 3, max = 20, message = "Username must be between 3 and 20 characters")
            String username) {
        boolean available = applicationService.isUsernameAvailable(username);
        return Result.success(available);
    }

    @GetMapping("/check-email")
    @Operation(summary = "Check email availability", description = "Check if an email is available for registration")
    public Result<Boolean> checkEmail(
            @RequestParam
            @NotBlank(message = "Email is required")
            @Email(message = "Invalid email format")
            @Size(max = 100, message = "Email must be at most 100 characters")
            String email) {
        boolean available = applicationService.isEmailAvailable(email);
        return Result.success(available);
    }

    @GetMapping("/application/{memberId}/status")
    @Operation(summary = "Get application status", description = "Query the status of a member application by member ID")
    public Result<ApplicationStatusResponse> getApplicationStatus(@PathVariable Long memberId) {
        ApplicationStatusResponse response = applicationService.getApplicationStatus(memberId);
        return Result.success(response);
    }
}
