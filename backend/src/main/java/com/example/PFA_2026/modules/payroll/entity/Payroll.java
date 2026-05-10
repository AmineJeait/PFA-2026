package com.example.PFA_2026.modules.payroll.entity;

import com.example.PFA_2026.common.BaseEntity;
import com.example.PFA_2026.modules.employee.entity.Employee;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payrolls",
        uniqueConstraints = @UniqueConstraint(columnNames = {"employee_id", "month", "year"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Payroll extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(nullable = false)
    private int month; // 1 to 12

    @Column(nullable = false)
    private int year;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal baseSalary;

    @Column(precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal bonuses = BigDecimal.ZERO;

    @Column(precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal deductions = BigDecimal.ZERO;

    @Column(precision = 10, scale = 2)
    private BigDecimal cnss; // calculated: 4.48% capped at base 6000

    @Column(precision = 10, scale = 2)
    private BigDecimal amo;  // calculated: 2.26%

    @Column(precision = 10, scale = 2)
    private BigDecimal ir;   // calculated: progressive rate

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal netSalary; // calculated

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private PayrollStatus status = PayrollStatus.BROUILLON;

    private LocalDateTime paidAt;

    public enum PayrollStatus {
        BROUILLON, VALIDE, PAYE
    }
}