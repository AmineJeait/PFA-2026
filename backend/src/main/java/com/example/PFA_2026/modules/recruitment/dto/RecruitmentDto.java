package com.example.PFA_2026.modules.recruitment.dto;

import com.example.PFA_2026.modules.employee.entity.Employee;
import com.example.PFA_2026.modules.recruitment.entity.Application;
import com.example.PFA_2026.modules.recruitment.entity.JobOffer;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class RecruitmentDto {

    // ─── JobOffer Requests ─────────────────────────────────────────────────

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class CreateJobOfferRequest {

        @NotBlank(message = "Job title is required")
        private String title;

        private String description;
        private Long departmentId;
        private Long positionId;
        private String requiredSkills;
        private Employee.ContractType contractType;
        private LocalDate closingDate;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class UpdateJobOfferRequest {

        @NotBlank(message = "Job title is required")
        private String title;

        private String description;
        private Long departmentId;
        private Long positionId;
        private String requiredSkills;
        private Employee.ContractType contractType;
        private JobOffer.JobStatus status;
        private LocalDate closingDate;
    }

    // ─── Application Requests ──────────────────────────────────────────────

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class CreateApplicationRequest {

        @NotBlank(message = "Candidate name is required")
        private String candidateName;

        @NotBlank(message = "Candidate email is required")
        @Email(message = "Invalid email format")
        private String candidateEmail;

        private String candidatePhone;
        private String cvUrl;
        private String coverLetter;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class UpdateApplicationStatusRequest {

        @NotNull(message = "Status is required")
        private Application.ApplicationStatus status;

        private String notes;
    }

    // ─── Responses ─────────────────────────────────────────────────────────

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class JobOfferResponse {
        private Long id;
        private String title;
        private String description;
        private Long departmentId;
        private String departmentName;
        private Long positionId;
        private String positionTitle;
        private String requiredSkills;
        private Employee.ContractType contractType;
        private JobOffer.JobStatus status;
        private LocalDate closingDate;

        public static JobOfferResponse fromEntity(JobOffer j) {
            return JobOfferResponse.builder()
                    .id(j.getId())
                    .title(j.getTitle())
                    .description(j.getDescription())
                    .departmentId(j.getDepartment() != null ? j.getDepartment().getId() : null)
                    .departmentName(j.getDepartment() != null ? j.getDepartment().getName() : null)
                    .positionId(j.getPosition() != null ? j.getPosition().getId() : null)
                    .positionTitle(j.getPosition() != null ? j.getPosition().getTitle() : null)
                    .requiredSkills(j.getRequiredSkills())
                    .contractType(j.getContractType())
                    .status(j.getStatus())
                    .closingDate(j.getClosingDate())
                    .build();
        }
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ApplicationResponse {
        private Long id;
        private Long jobOfferId;
        private String jobOfferTitle;
        private String candidateName;
        private String candidateEmail;
        private String candidatePhone;
        private String cvUrl;
        private String coverLetter;
        private Application.ApplicationStatus status;
        private LocalDateTime appliedAt;
        private String notes;

        public static ApplicationResponse fromEntity(Application a) {
            return ApplicationResponse.builder()
                    .id(a.getId())
                    .jobOfferId(a.getJobOffer().getId())
                    .jobOfferTitle(a.getJobOffer().getTitle())
                    .candidateName(a.getCandidateName())
                    .candidateEmail(a.getCandidateEmail())
                    .candidatePhone(a.getCandidatePhone())
                    .cvUrl(a.getCvUrl())
                    .coverLetter(a.getCoverLetter())
                    .status(a.getStatus())
                    .appliedAt(a.getAppliedAt())
                    .notes(a.getNotes())
                    .build();
        }
    }
}