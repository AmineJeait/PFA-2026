package com.example.PFA_2026.modules.leave.dto;

import com.example.PFA_2026.modules.leave.entity.LeaveRequest;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

public class LeaveDto {

    // ─── Requests ──────────────────────────────────────────────────────────

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class CreateLeaveRequest {

        @NotNull(message = "Leave type is required")
        private LeaveRequest.LeaveType type;

        @NotNull(message = "Start date is required")
        private LocalDate startDate;

        @NotNull(message = "End date is required")
        private LocalDate endDate;

        private String reason;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class RejectLeaveRequest {
        private String comments;
    }

    // ─── Response ──────────────────────────────────────────────────────────

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class LeaveResponse {
        private Long id;
        private Long employeeId;
        private String employeeName;
        private LeaveRequest.LeaveType type;
        private LocalDate startDate;
        private LocalDate endDate;
        private long durationDays;
        private String reason;
        private LeaveRequest.LeaveStatus status;
        private Long approvedById;
        private String approvedByName;
        private LocalDateTime approvedAt;
        private String comments;

        public static LeaveResponse fromEntity(LeaveRequest l) {
            return LeaveResponse.builder()
                    .id(l.getId())
                    .employeeId(l.getEmployee().getId())
                    .employeeName(l.getEmployee().getFullName())
                    .type(l.getType())
                    .startDate(l.getStartDate())
                    .endDate(l.getEndDate())
                    .durationDays(ChronoUnit.DAYS.between(l.getStartDate(), l.getEndDate()) + 1)
                    .reason(l.getReason())
                    .status(l.getStatus())
                    .approvedById(l.getApprovedBy() != null ? l.getApprovedBy().getId() : null)
                    .approvedByName(l.getApprovedBy() != null ? l.getApprovedBy().getFullName() : null)
                    .approvedAt(l.getApprovedAt())
                    .comments(l.getComments())
                    .build();
        }
    }
}