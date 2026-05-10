package com.example.PFA_2026.modules.employee.entity;

import com.example.PFA_2026.common.BaseEntity;
import com.example.PFA_2026.modules.auth.entity.User;
import com.example.PFA_2026.modules.department.entity.Department;
import com.example.PFA_2026.modules.department.entity.Position;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "employees")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Employee extends BaseEntity {

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(nullable = false, unique = true)
    private String email;

    private String phone;

    private LocalDate dateOfBirth;

    private String address;

    private String cin;

    @Column(nullable = false)
    private LocalDate hireDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EmployeeStatus status;

    @Enumerated(EnumType.STRING)
    private ContractType contractType;

    @Column(precision = 10, scale = 2)
    private BigDecimal baseSalary;

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_id")
    private Employee manager;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "position_id")
    private Position position;

    public String getFullName() {
        return firstName + " " + lastName;
    }

    public enum EmployeeStatus {
        ACTIF, INACTIF, EN_CONGE, SUSPENDU
    }

    public enum ContractType {
        CDI, CDD, STAGE, FREELANCE
    }

    public enum Role {
        ADMIN, RH, MANAGER, EMPLOYEE
    }
}