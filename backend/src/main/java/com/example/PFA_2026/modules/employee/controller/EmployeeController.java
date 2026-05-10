package com.example.PFA_2026.modules.employee.controller;

import com.example.PFA_2026.common.ApiResponse;
import com.example.PFA_2026.modules.employee.dto.EmployeeDto;
import com.example.PFA_2026.modules.employee.service.EmployeeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employees")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService employeeService;

    @PostMapping
    public ResponseEntity<ApiResponse<EmployeeDto.Response>> create(
            @Valid @RequestBody EmployeeDto.CreateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Employé créé", employeeService.create(request)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<EmployeeDto.Response>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(employeeService.getAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EmployeeDto.Response>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(employeeService.getById(id)));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<EmployeeDto.Response>>> search(@RequestParam String query) {
        return ResponseEntity.ok(ApiResponse.ok(employeeService.search(query)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<EmployeeDto.Response>> update(
            @PathVariable Long id,
            @RequestBody EmployeeDto.UpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Employé mis à jour", employeeService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        employeeService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Employé supprimé", null));
    }
}