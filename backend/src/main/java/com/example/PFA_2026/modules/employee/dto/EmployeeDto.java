package com.example.PFA_2026.modules.employee.dto;

import com.example.PFA_2026.modules.employee.entity.Employee;
import jakarta.validation.constraints.*;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class EmployeeDto {

    @Data
    public static class CreateRequest {

        @NotBlank(message = "Prénom obligatoire")
        private String firstName;

        @NotBlank(message = "Nom obligatoire")
        private String lastName;

        @Email(message = "Email invalide")
        @NotBlank(message = "Email obligatoire")
        private String email;

        @NotBlank(message = "Mot de passe obligatoire")
        @Size(min = 6, message = "Minimum 6 caractères")
        private String password;

        private String phone;
        private String cin;
        private LocalDate dateOfBirth;
        private String address;

        @NotNull(message = "Date d'embauche obligatoire")
        private LocalDate hireDate;

        @NotNull(message = "Statut obligatoire")
        private Employee.EmployeeStatus status;

        private Employee.ContractType contractType;

        @DecimalMin(value = "0.0", message = "Salaire doit être positif")
        private BigDecimal baseSalary;

        private Long managerId;

        private Employee.Role role = Employee.Role.EMPLOYEE;
    }

    @Data
    public static class UpdateRequest {
        private String firstName;
        private String lastName;
        private String phone;
        private String cin;
        private LocalDate dateOfBirth;
        private String address;
        private Employee.EmployeeStatus status;
        private Employee.ContractType contractType;
        private BigDecimal baseSalary;
        private Long managerId;
    }

    @Data
    @Builder
    public static class Response {
        private Long id;
        private String firstName;
        private String lastName;
        private String email;
        private String phone;
        private String cin;
        private LocalDate dateOfBirth;
        private String address;
        private LocalDate hireDate;
        private Employee.EmployeeStatus status;
        private Employee.ContractType contractType;
        private BigDecimal baseSalary;
        private String managerName;
        private Long managerId;
        private LocalDateTime createdAt;

        public static Response fromEntity(Employee e) {
            return Response.builder()
                    .id(e.getId())
                    .firstName(e.getFirstName())
                    .lastName(e.getLastName())
                    .email(e.getEmail())
                    .phone(e.getPhone())
                    .cin(e.getCin())
                    .dateOfBirth(e.getDateOfBirth())
                    .address(e.getAddress())
                    .hireDate(e.getHireDate())
                    .status(e.getStatus())
                    .contractType(e.getContractType())
                    .baseSalary(e.getBaseSalary())
                    .managerName(e.getManager() != null ? e.getManager().getFullName() : null)
                    .managerId(e.getManager() != null ? e.getManager().getId() : null)
                    .createdAt(e.getCreatedAt())
                    .build();
        }
    }
}