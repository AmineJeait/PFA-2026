package com.example.PFA_2026.modules.payroll.controller;

import com.example.PFA_2026.common.ApiResponse;
import com.example.PFA_2026.modules.payroll.dto.PayrollDto;
import com.example.PFA_2026.modules.payroll.service.PayrollService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payroll")
@RequiredArgsConstructor
public class PayrollController {

    private final PayrollService payrollService;

    @PostMapping("/generate")
    @PreAuthorize("hasAnyRole('ADMIN', 'RH')")
    public ResponseEntity<ApiResponse<PayrollDto.PayrollResponse>> generatePayroll(
            @Valid @RequestBody PayrollDto.GeneratePayrollRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Payroll generated successfully",
                        payrollService.generatePayroll(request)));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RH')")
    public ResponseEntity<ApiResponse<List<PayrollDto.PayrollResponse>>> getAllPayrolls() {
        return ResponseEntity.ok(ApiResponse.ok("Payrolls fetched successfully",
                payrollService.getAllPayrolls()));
    }

    @GetMapping("/employee/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RH', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<List<PayrollDto.PayrollResponse>>> getPayrollsByEmployee(
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Employee payrolls fetched successfully",
                payrollService.getPayrollsByEmployee(id)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RH', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<PayrollDto.PayrollResponse>> getPayrollById(
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Payroll fetched successfully",
                payrollService.getPayrollById(id)));
    }

    @PutMapping("/{id}/validate")
    @PreAuthorize("hasAnyRole('ADMIN', 'RH')")
    public ResponseEntity<ApiResponse<PayrollDto.PayrollResponse>> validatePayroll(
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Payroll validated successfully",
                payrollService.validatePayroll(id)));
    }

    @PutMapping("/{id}/pay")
    @PreAuthorize("hasAnyRole('ADMIN', 'RH')")
    public ResponseEntity<ApiResponse<PayrollDto.PayrollResponse>> payPayroll(
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Payroll marked as paid successfully",
                payrollService.payPayroll(id)));
    }
}