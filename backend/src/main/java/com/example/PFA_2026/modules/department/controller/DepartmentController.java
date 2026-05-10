package com.example.PFA_2026.modules.department.controller;

import com.example.PFA_2026.common.ApiResponse;
import com.example.PFA_2026.modules.department.dto.DepartmentDto;
import com.example.PFA_2026.modules.department.service.DepartmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class DepartmentController {

    private final DepartmentService departmentService;

    // ─── Department Endpoints ──────────────────────────────────────────────

    @GetMapping("/api/departments")
    @PreAuthorize("hasAnyRole('ADMIN', 'RH', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<List<DepartmentDto.DepartmentResponse>>> getAllDepartments() {
        return ResponseEntity.ok(ApiResponse.ok("Departments fetched successfully",
                departmentService.getAllDepartments()));
    }

    @GetMapping("/api/departments/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RH', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<DepartmentDto.DepartmentResponse>> getDepartmentById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Department fetched successfully",
                departmentService.getDepartmentById(id)));
    }

    @PostMapping("/api/departments")
    @PreAuthorize("hasAnyRole('ADMIN', 'RH')")
    public ResponseEntity<ApiResponse<DepartmentDto.DepartmentResponse>> createDepartment(
            @Valid @RequestBody DepartmentDto.CreateDepartmentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Department created successfully",
                        departmentService.createDepartment(request)));
    }

    @PutMapping("/api/departments/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RH')")
    public ResponseEntity<ApiResponse<DepartmentDto.DepartmentResponse>> updateDepartment(
            @PathVariable Long id,
            @Valid @RequestBody DepartmentDto.UpdateDepartmentRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Department updated successfully",
                departmentService.updateDepartment(id, request)));
    }

    @DeleteMapping("/api/departments/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteDepartment(@PathVariable Long id) {
        departmentService.deleteDepartment(id);
        return ResponseEntity.ok(ApiResponse.ok("Department deleted successfully", null));
    }

    @GetMapping("/api/departments/{id}/employees")
    @PreAuthorize("hasAnyRole('ADMIN', 'RH', 'MANAGER')")
    public ResponseEntity<ApiResponse<List<DepartmentDto.EmployeeInDepartmentResponse>>> getEmployeesInDepartment(
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Employees fetched successfully",
                departmentService.getEmployeesInDepartment(id)));
    }

    // ─── Position Endpoints ────────────────────────────────────────────────

    @GetMapping("/api/positions")
    @PreAuthorize("hasAnyRole('ADMIN', 'RH', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<List<DepartmentDto.PositionResponse>>> getAllPositions() {
        return ResponseEntity.ok(ApiResponse.ok("Positions fetched successfully",
                departmentService.getAllPositions()));
    }

    @PostMapping("/api/positions")
    @PreAuthorize("hasAnyRole('ADMIN', 'RH')")
    public ResponseEntity<ApiResponse<DepartmentDto.PositionResponse>> createPosition(
            @Valid @RequestBody DepartmentDto.CreatePositionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Position created successfully",
                        departmentService.createPosition(request)));
    }

    @DeleteMapping("/api/positions/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deletePosition(@PathVariable Long id) {
        departmentService.deletePosition(id);
        return ResponseEntity.ok(ApiResponse.ok("Position deleted successfully", null));
    }
}