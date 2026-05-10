package com.example.PFA_2026.modules.attendance.controller;

import com.example.PFA_2026.common.ApiResponse;
import com.example.PFA_2026.modules.attendance.dto.AttendanceDto;
import com.example.PFA_2026.modules.attendance.service.AttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    @PostMapping("/checkin")
    @PreAuthorize("hasAnyRole('ADMIN', 'RH', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<AttendanceDto.AttendanceResponse>> checkIn(
            @RequestBody(required = false) AttendanceDto.CheckInRequest request) {
        if (request == null) request = new AttendanceDto.CheckInRequest();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Checked in successfully",
                        attendanceService.checkIn(request)));
    }

    @PutMapping("/checkout")
    @PreAuthorize("hasAnyRole('ADMIN', 'RH', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<AttendanceDto.AttendanceResponse>> checkOut(
            @RequestBody(required = false) AttendanceDto.CheckOutRequest request) {
        if (request == null) request = new AttendanceDto.CheckOutRequest();
        return ResponseEntity.ok(ApiResponse.ok("Checked out successfully",
                attendanceService.checkOut(request)));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RH')")
    public ResponseEntity<ApiResponse<List<AttendanceDto.AttendanceResponse>>> getAllAttendances() {
        return ResponseEntity.ok(ApiResponse.ok("Attendances fetched successfully",
                attendanceService.getAllAttendances()));
    }

    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('ADMIN', 'RH', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<List<AttendanceDto.AttendanceResponse>>> getMyAttendances() {
        return ResponseEntity.ok(ApiResponse.ok("Your attendances fetched successfully",
                attendanceService.getMyAttendances()));
    }

    @GetMapping("/employee/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RH', 'MANAGER')")
    public ResponseEntity<ApiResponse<List<AttendanceDto.AttendanceResponse>>> getAttendancesByEmployee(
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Employee attendances fetched successfully",
                attendanceService.getAttendancesByEmployee(id)));
    }

    @GetMapping("/report")
    @PreAuthorize("hasAnyRole('ADMIN', 'RH')")
    public ResponseEntity<ApiResponse<List<AttendanceDto.MonthlyReportResponse>>> getMonthlyReport(
            @RequestParam int month,
            @RequestParam int year) {
        return ResponseEntity.ok(ApiResponse.ok("Monthly report generated successfully",
                attendanceService.getMonthlyReport(month, year)));
    }
}