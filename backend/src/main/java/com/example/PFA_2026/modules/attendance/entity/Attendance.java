package com.example.PFA_2026.modules.attendance.entity;

import com.example.PFA_2026.common.BaseEntity;
import com.example.PFA_2026.modules.employee.entity.Employee;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "attendances",
        uniqueConstraints = @UniqueConstraint(columnNames = {"employee_id", "date"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Attendance extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private LocalTime checkIn;

    private LocalTime checkOut; // nullable — filled on checkout

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private AttendanceStatus status = AttendanceStatus.PRESENT;

    private Double hoursWorked; // calculated on checkout

    @Column(columnDefinition = "TEXT")
    private String notes;

    public enum AttendanceStatus {
        PRESENT, ABSENT, RETARD, DEMI_JOURNEE
    }
}