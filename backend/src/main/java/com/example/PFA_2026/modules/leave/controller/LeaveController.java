package com.example.PFA_2026.modules.leave.controller;

import com.example.PFA_2026.common.ApiResponse;
import com.example.PFA_2026.modules.leave.dto.LeaveDto;
import com.example.PFA_2026.modules.leave.service.LeaveService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leaves")
@RequiredArgsConstructor
public class LeaveController {

    private final LeaveService leaveService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RH', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<LeaveDto.LeaveResponse>> createLeave(
            @Valid @RequestBody LeaveDto.CreateLeaveRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Leave request submitted successfully",
                        leaveService.createLeave(request)));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RH', 'MANAGER')")
    public ResponseEntity<ApiResponse<List<LeaveDto.LeaveResponse>>> getAllLeaves() {
        return ResponseEntity.ok(ApiResponse.ok("Leave requests fetched successfully",
                leaveService.getAllLeaves()));
    }

    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('ADMIN', 'RH', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<List<LeaveDto.LeaveResponse>>> getMyLeaves() {
        return ResponseEntity.ok(ApiResponse.ok("Your leave requests fetched successfully",
                leaveService.getMyLeaves()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RH', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<LeaveDto.LeaveResponse>> getLeaveById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Leave request fetched successfully",
                leaveService.getLeaveById(id)));
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN', 'RH', 'MANAGER')")
    public ResponseEntity<ApiResponse<LeaveDto.LeaveResponse>> approveLeave(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Leave request approved successfully",
                leaveService.approveLeave(id)));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('ADMIN', 'RH', 'MANAGER')")
    public ResponseEntity<ApiResponse<LeaveDto.LeaveResponse>> rejectLeave(
            @PathVariable Long id,
            @RequestBody(required = false) LeaveDto.RejectLeaveRequest request) {
        if (request == null) request = new LeaveDto.RejectLeaveRequest();
        return ResponseEntity.ok(ApiResponse.ok("Leave request rejected successfully",
                leaveService.rejectLeave(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RH', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<Void>> cancelLeave(@PathVariable Long id) {
        leaveService.cancelLeave(id);
        return ResponseEntity.ok(ApiResponse.ok("Leave request cancelled successfully", null));
    }

    @GetMapping("/balance")
    @PreAuthorize("hasAnyRole('ADMIN', 'RH', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<List<LeaveDto.LeaveBalanceResponse>>> getLeaveBalance() {
        return ResponseEntity.ok(ApiResponse.ok("Leave balance fetched successfully",
                leaveService.getLeaveBalance()));
    }
}