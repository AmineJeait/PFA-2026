package com.example.PFA_2026.modules.department.dto;

import com.example.PFA_2026.modules.department.entity.Department;
import com.example.PFA_2026.modules.department.entity.Position;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.List;

public class DepartmentDto {

    // ─── Department Requests ───────────────────────────────────────────────

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class CreateDepartmentRequest {
        @NotBlank(message = "Department name is required")
        private String name;

        private String description;

        private Long headEmployeeId; // optional
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class UpdateDepartmentRequest {
        @NotBlank(message = "Department name is required")
        private String name;

        private String description;

        private Long headEmployeeId; // optional, null = remove head
    }

    // ─── Position Requests ─────────────────────────────────────────────────

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class CreatePositionRequest {
        @NotBlank(message = "Position title is required")
        private String title;

        private String description;

        @NotNull(message = "Department ID is required")
        private Long departmentId;
    }

    // ─── Responses ─────────────────────────────────────────────────────────

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class DepartmentResponse {
        private Long id;
        private String name;
        private String description;
        private Long headEmployeeId;
        private String headEmployeeName;
        private int employeeCount;

        public static DepartmentResponse fromEntity(Department d) {
            return DepartmentResponse.builder()
                    .id(d.getId())
                    .name(d.getName())
                    .description(d.getDescription())
                    .headEmployeeId(d.getHead() != null ? d.getHead().getId() : null)
                    .headEmployeeName(d.getHead() != null
                            ? d.getHead().getFirstName() + " " + d.getHead().getLastName()
                            : null)
                    .employeeCount(d.getEmployees() != null ? d.getEmployees().size() : 0)
                    .build();
        }
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class PositionResponse {
        private Long id;
        private String title;
        private String description;
        private Long departmentId;
        private String departmentName;

        public static PositionResponse fromEntity(Position p) {
            return PositionResponse.builder()
                    .id(p.getId())
                    .title(p.getTitle())
                    .description(p.getDescription())
                    .departmentId(p.getDepartment().getId())
                    .departmentName(p.getDepartment().getName())
                    .build();
        }
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class EmployeeInDepartmentResponse {
        private Long id;
        private String fullName;
        private String email;
        private String positionTitle;

        public static EmployeeInDepartmentResponse fromEntity(
                com.example.PFA_2026.modules.employee.entity.Employee e) {
            return EmployeeInDepartmentResponse.builder()
                    .id(e.getId())
                    .fullName(e.getFirstName() + " " + e.getLastName())
                    .email(e.getEmail())
                    .positionTitle(e.getPosition() != null ? e.getPosition().getTitle() : null)
                    .build();
        }
    }
}