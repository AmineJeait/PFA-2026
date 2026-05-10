package com.example.PFA_2026.modules.payroll.dto;

import com.example.PFA_2026.modules.payroll.entity.Payroll;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class PayrollDto {

    // ─── Requests ──────────────────────────────────────────────────────────

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class GeneratePayrollRequest {

        @NotNull(message = "Employee ID is required")
        private Long employeeId;

        @NotNull(message = "Month is required")
        @Min(value = 1, message = "Month must be between 1 and 12")
        @Max(value = 12, message = "Month must be between 1 and 12")
        private Integer month;

        @NotNull(message = "Year is required")
        @Min(value = 2000, message = "Year must be 2000 or later")
        private Integer year;

        private BigDecimal bonuses;    // optional, defaults to 0
        private BigDecimal deductions; // optional, defaults to 0
    }

    // ─── Response ──────────────────────────────────────────────────────────

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class PayrollResponse {
        private Long id;
        private Long employeeId;
        private String employeeName;
        private int month;
        private int year;
        private BigDecimal baseSalary;
        private BigDecimal bonuses;
        private BigDecimal deductions;
        private BigDecimal cnss;
        private BigDecimal amo;
        private BigDecimal ir;
        private BigDecimal netSalary;
        private Payroll.PayrollStatus status;
        private LocalDateTime paidAt;

        public static PayrollResponse fromEntity(Payroll p) {
            return PayrollResponse.builder()
                    .id(p.getId())
                    .employeeId(p.getEmployee().getId())
                    .employeeName(p.getEmployee().getFullName())
                    .month(p.getMonth())
                    .year(p.getYear())
                    .baseSalary(p.getBaseSalary())
                    .bonuses(p.getBonuses())
                    .deductions(p.getDeductions())
                    .cnss(p.getCnss())
                    .amo(p.getAmo())
                    .ir(p.getIr())
                    .netSalary(p.getNetSalary())
                    .status(p.getStatus())
                    .paidAt(p.getPaidAt())
                    .build();
        }
    }
}