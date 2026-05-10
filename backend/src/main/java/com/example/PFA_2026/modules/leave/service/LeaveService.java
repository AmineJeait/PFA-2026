package com.example.PFA_2026.modules.leave.service;

import com.example.PFA_2026.modules.employee.entity.Employee;
import com.example.PFA_2026.modules.employee.repository.EmployeeRepository;
import com.example.PFA_2026.modules.leave.dto.LeaveDto;
import com.example.PFA_2026.modules.leave.entity.LeaveRequest;
import com.example.PFA_2026.modules.leave.repository.LeaveRequestRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LeaveService {

    private final LeaveRequestRepository leaveRequestRepository;
    private final EmployeeRepository employeeRepository;

    // ─── Submit a leave request ────────────────────────────────────────────

    @Transactional
    public LeaveDto.LeaveResponse createLeave(LeaveDto.CreateLeaveRequest request) {
        Employee employee = getCurrentEmployee();

        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new IllegalArgumentException("End date cannot be before start date");
        }

        LeaveRequest leave = LeaveRequest.builder()
                .employee(employee)
                .type(request.getType())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .reason(request.getReason())
                .build();

        return LeaveDto.LeaveResponse.fromEntity(leaveRequestRepository.save(leave));
    }

    // ─── Get all leave requests (RH / Admin) ──────────────────────────────

    @Transactional(readOnly = true)
    public List<LeaveDto.LeaveResponse> getAllLeaves() {
        return leaveRequestRepository.findAll()
                .stream()
                .map(LeaveDto.LeaveResponse::fromEntity)
                .toList();
    }

    // ─── Get current employee's leave requests ────────────────────────────

    @Transactional(readOnly = true)
    public List<LeaveDto.LeaveResponse> getMyLeaves() {
        return employeeRepository.findByEmail(SecurityContextHolder.getContext().getAuthentication().getName())
                .map(employee -> leaveRequestRepository.findByEmployeeId(employee.getId())
                        .stream()
                        .map(LeaveDto.LeaveResponse::fromEntity)
                        .toList())
                .orElse(List.of());
    }

    // ─── Get one leave request ─────────────────────────────────────────────

    @Transactional(readOnly = true)
    public LeaveDto.LeaveResponse getLeaveById(Long id) {
        return LeaveDto.LeaveResponse.fromEntity(findLeaveOrThrow(id));
    }

    // ─── Approve ──────────────────────────────────────────────────────────

    @Transactional
    public LeaveDto.LeaveResponse approveLeave(Long id) {
        LeaveRequest leave = findLeaveOrThrow(id);

        if (leave.getStatus() != LeaveRequest.LeaveStatus.EN_ATTENTE) {
            throw new IllegalStateException("Only pending leave requests can be approved");
        }

        Employee approver = getCurrentEmployee();
        leave.setStatus(LeaveRequest.LeaveStatus.APPROUVE);
        leave.setApprovedBy(approver);
        leave.setApprovedAt(LocalDateTime.now());

        return LeaveDto.LeaveResponse.fromEntity(leaveRequestRepository.save(leave));
    }

    // ─── Reject ───────────────────────────────────────────────────────────

    @Transactional
    public LeaveDto.LeaveResponse rejectLeave(Long id, LeaveDto.RejectLeaveRequest request) {
        LeaveRequest leave = findLeaveOrThrow(id);

        if (leave.getStatus() != LeaveRequest.LeaveStatus.EN_ATTENTE) {
            throw new IllegalStateException("Only pending leave requests can be rejected");
        }

        Employee approver = getCurrentEmployee();
        leave.setStatus(LeaveRequest.LeaveStatus.REJETE);
        leave.setApprovedBy(approver);
        leave.setApprovedAt(LocalDateTime.now());
        leave.setComments(request.getComments());

        return LeaveDto.LeaveResponse.fromEntity(leaveRequestRepository.save(leave));
    }

    // ─── Cancel ───────────────────────────────────────────────────────────

    @Transactional
    public void cancelLeave(Long id) {
        LeaveRequest leave = findLeaveOrThrow(id);
        Employee currentEmployee = getCurrentEmployee();

        if (!leave.getEmployee().getId().equals(currentEmployee.getId())) {
            throw new IllegalStateException("You can only cancel your own leave requests");
        }

        if (leave.getStatus() != LeaveRequest.LeaveStatus.EN_ATTENTE) {
            throw new IllegalStateException("Only pending leave requests can be cancelled");
        }

        leaveRequestRepository.delete(leave);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────

    private LeaveRequest findLeaveOrThrow(Long id) {
        return leaveRequestRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Leave request not found with id: " + id));
    }

    private Employee getCurrentEmployee() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return employeeRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("Employee not found for current user"));
    }
}