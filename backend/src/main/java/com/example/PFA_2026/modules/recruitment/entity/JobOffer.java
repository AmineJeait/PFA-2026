package com.example.PFA_2026.modules.recruitment.entity;

import com.example.PFA_2026.common.BaseEntity;
import com.example.PFA_2026.modules.department.entity.Department;
import com.example.PFA_2026.modules.department.entity.Position;
import com.example.PFA_2026.modules.employee.entity.Employee;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "job_offers")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class JobOffer extends BaseEntity {

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "position_id")
    private Position position;

    @Column(columnDefinition = "TEXT")
    private String requiredSkills;

    @Enumerated(EnumType.STRING)
    private Employee.ContractType contractType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private JobStatus status = JobStatus.OUVERT;

    private LocalDate closingDate;

    public enum JobStatus {
        OUVERT, FERME, ANNULE
    }
}