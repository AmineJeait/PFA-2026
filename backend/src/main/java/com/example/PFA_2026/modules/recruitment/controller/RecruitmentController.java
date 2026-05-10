package com.example.PFA_2026.modules.recruitment.controller;

import com.example.PFA_2026.common.ApiResponse;
import com.example.PFA_2026.modules.recruitment.dto.RecruitmentDto;
import com.example.PFA_2026.modules.recruitment.service.RecruitmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class RecruitmentController {

    private final RecruitmentService recruitmentService;

    // ─── Job Offer Endpoints ───────────────────────────────────────────────

    @PostMapping("/api/jobs")
    @PreAuthorize("hasAnyRole('ADMIN', 'RH')")
    public ResponseEntity<ApiResponse<RecruitmentDto.JobOfferResponse>> createJobOffer(
            @Valid @RequestBody RecruitmentDto.CreateJobOfferRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Job offer created successfully",
                        recruitmentService.createJobOffer(request)));
    }

    @GetMapping("/api/jobs")
    @PreAuthorize("hasAnyRole('ADMIN', 'RH', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<List<RecruitmentDto.JobOfferResponse>>> getAllJobOffers() {
        return ResponseEntity.ok(ApiResponse.ok("Job offers fetched successfully",
                recruitmentService.getAllJobOffers()));
    }

    @GetMapping("/api/jobs/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RH', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<RecruitmentDto.JobOfferResponse>> getJobOfferById(
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Job offer fetched successfully",
                recruitmentService.getJobOfferById(id)));
    }

    @PutMapping("/api/jobs/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RH')")
    public ResponseEntity<ApiResponse<RecruitmentDto.JobOfferResponse>> updateJobOffer(
            @PathVariable Long id,
            @Valid @RequestBody RecruitmentDto.UpdateJobOfferRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Job offer updated successfully",
                recruitmentService.updateJobOffer(id, request)));
    }

    @DeleteMapping("/api/jobs/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteJobOffer(@PathVariable Long id) {
        recruitmentService.deleteJobOffer(id);
        return ResponseEntity.ok(ApiResponse.ok("Job offer deleted successfully", null));
    }

    // ─── Application Endpoints ─────────────────────────────────────────────

    @PostMapping("/api/jobs/{id}/apply")
    @PreAuthorize("hasAnyRole('ADMIN', 'RH', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<RecruitmentDto.ApplicationResponse>> applyToJob(
            @PathVariable Long id,
            @Valid @RequestBody RecruitmentDto.CreateApplicationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Application submitted successfully",
                        recruitmentService.applyToJob(id, request)));
    }

    @GetMapping("/api/jobs/{id}/applications")
    @PreAuthorize("hasAnyRole('ADMIN', 'RH')")
    public ResponseEntity<ApiResponse<List<RecruitmentDto.ApplicationResponse>>> getApplicationsByJobOffer(
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Applications fetched successfully",
                recruitmentService.getApplicationsByJobOffer(id)));
    }

    @PutMapping("/api/applications/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'RH')")
    public ResponseEntity<ApiResponse<RecruitmentDto.ApplicationResponse>> updateApplicationStatus(
            @PathVariable Long id,
            @Valid @RequestBody RecruitmentDto.UpdateApplicationStatusRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Application status updated successfully",
                recruitmentService.updateApplicationStatus(id, request)));
    }
}