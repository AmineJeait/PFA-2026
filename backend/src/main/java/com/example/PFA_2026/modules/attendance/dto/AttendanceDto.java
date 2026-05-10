package com.example.PFA_2026.modules.attendance.dto;

import com.example.PFA_2026.modules.attendance.entity.Attendance;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

public class AttendanceDto {

    // ─── Requests ──────────────────────────────────────────────────────────

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class CheckInRequest {
        private String notes;
        // employee resolved from JWT, date = today, checkIn = now
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class CheckOutRequest {
        private String notes;
        // employee resolved from JWT, date = today, checkOut = now
    }

    // ─── Response ──────────────────────────────────────────────────────────

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class AttendanceResponse {
        private Long id;
        private Long employeeId;
        private String employeeName;
        private LocalDate date;
        private LocalTime checkIn;
        private LocalTime checkOut;
        private Double hoursWorked;
        private Attendance.AttendanceStatus status;
        private String notes;

        public static AttendanceResponse fromEntity(Attendance a) {
            return AttendanceResponse.builder()
                    .id(a.getId())
                    .employeeId(a.getEmployee().getId())
                    .employeeName(a.getEmployee().getFullName())
                    .date(a.getDate())
                    .checkIn(a.getCheckIn())
                    .checkOut(a.getCheckOut())
                    .hoursWorked(a.getHoursWorked())
                    .status(a.getStatus())
                    .notes(a.getNotes())
                    .build();
        }
    }

    // ─── Monthly Report ────────────────────────────────────────────────────

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class MonthlyReportResponse {
        private Long employeeId;
        private String employeeName;
        private int month;
        private int year;
        private long totalDays;
        private long presentDays;
        private long absentDays;
        private long lateDays;
        private long halfDays;
        private double totalHoursWorked;
    }
}