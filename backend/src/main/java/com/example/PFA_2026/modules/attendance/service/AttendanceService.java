package com.example.PFA_2026.modules.attendance.service;

import com.example.PFA_2026.modules.attendance.dto.AttendanceDto;
import com.example.PFA_2026.modules.attendance.entity.Attendance;
import com.example.PFA_2026.modules.attendance.repository.AttendanceRepository;
import com.example.PFA_2026.modules.employee.entity.Employee;
import com.example.PFA_2026.modules.employee.repository.EmployeeRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.YearMonth;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;

    // Late threshold — check-in after 09:00 is considered RETARD
    private static final LocalTime LATE_THRESHOLD = LocalTime.of(9, 0);

    // ─── Check In ─────────────────────────────────────────────────────────

    @Transactional
    public AttendanceDto.AttendanceResponse checkIn(AttendanceDto.CheckInRequest request) {
        Employee employee = getCurrentEmployee();
        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();

        if (attendanceRepository.existsByEmployeeIdAndDate(employee.getId(), today)) {
            throw new IllegalStateException("You have already checked in today");
        }

        Attendance.AttendanceStatus status = now.isAfter(LATE_THRESHOLD)
                ? Attendance.AttendanceStatus.RETARD
                : Attendance.AttendanceStatus.PRESENT;

        Attendance attendance = Attendance.builder()
                .employee(employee)
                .date(today)
                .checkIn(now)
                .status(status)
                .notes(request.getNotes())
                .build();

        return AttendanceDto.AttendanceResponse.fromEntity(attendanceRepository.save(attendance));
    }

    // ─── Check Out ────────────────────────────────────────────────────────

    @Transactional
    public AttendanceDto.AttendanceResponse checkOut(AttendanceDto.CheckOutRequest request) {
        Employee employee = getCurrentEmployee();
        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();

        Attendance attendance = attendanceRepository.findByEmployeeIdAndDate(employee.getId(), today)
                .orElseThrow(() -> new IllegalStateException("You have not checked in today"));

        if (attendance.getCheckOut() != null) {
            throw new IllegalStateException("You have already checked out today");
        }

        double hoursWorked = ChronoUnit.MINUTES.between(attendance.getCheckIn(), now) / 60.0;

        // If less than 5 hours worked, mark as DEMI_JOURNEE
        if (hoursWorked < 5.0 && attendance.getStatus() != Attendance.AttendanceStatus.RETARD) {
            attendance.setStatus(Attendance.AttendanceStatus.DEMI_JOURNEE);
        }

        attendance.setCheckOut(now);
        attendance.setHoursWorked(Math.round(hoursWorked * 100.0) / 100.0);

        if (request.getNotes() != null) {
            attendance.setNotes(request.getNotes());
        }

        return AttendanceDto.AttendanceResponse.fromEntity(attendanceRepository.save(attendance));
    }

    // ─── Get All (RH / Admin) ─────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<AttendanceDto.AttendanceResponse> getAllAttendances() {
        return attendanceRepository.findAll()
                .stream()
                .map(AttendanceDto.AttendanceResponse::fromEntity)
                .toList();
    }

    // ─── Get My Attendances ───────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<AttendanceDto.AttendanceResponse> getMyAttendances() {
        return employeeRepository.findByEmail(SecurityContextHolder.getContext().getAuthentication().getName())
                .map(employee -> attendanceRepository.findByEmployeeId(employee.getId())
                        .stream()
                        .map(AttendanceDto.AttendanceResponse::fromEntity)
                        .toList())
                .orElse(List.of());
    }

    // ─── Get by Employee ──────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<AttendanceDto.AttendanceResponse> getAttendancesByEmployee(Long employeeId) {
        if (!employeeRepository.existsById(employeeId)) {
            throw new EntityNotFoundException("Employee not found with id: " + employeeId);
        }
        return attendanceRepository.findByEmployeeId(employeeId)
                .stream()
                .map(AttendanceDto.AttendanceResponse::fromEntity)
                .toList();
    }

    // ─── Monthly Report ───────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<AttendanceDto.MonthlyReportResponse> getMonthlyReport(int month, int year) {
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate start = yearMonth.atDay(1);
        LocalDate end = yearMonth.atEndOfMonth();

        List<Attendance> records = attendanceRepository.findByDateBetween(start, end);

        // Group records by employee
        Map<Employee, List<Attendance>> byEmployee = records.stream()
                .collect(Collectors.groupingBy(Attendance::getEmployee));

        return byEmployee.entrySet().stream()
                .map(entry -> buildMonthlyReport(entry.getKey(), entry.getValue(), month, year))
                .toList();
    }

    // ─── Helpers ──────────────────────────────────────────────────────────

    private AttendanceDto.MonthlyReportResponse buildMonthlyReport(
            Employee employee, List<Attendance> records, int month, int year) {

        long presentDays  = records.stream().filter(a -> a.getStatus() == Attendance.AttendanceStatus.PRESENT).count();
        long absentDays   = records.stream().filter(a -> a.getStatus() == Attendance.AttendanceStatus.ABSENT).count();
        long lateDays     = records.stream().filter(a -> a.getStatus() == Attendance.AttendanceStatus.RETARD).count();
        long halfDays     = records.stream().filter(a -> a.getStatus() == Attendance.AttendanceStatus.DEMI_JOURNEE).count();
        double totalHours = records.stream()
                .filter(a -> a.getHoursWorked() != null)
                .mapToDouble(Attendance::getHoursWorked)
                .sum();

        return AttendanceDto.MonthlyReportResponse.builder()
                .employeeId(employee.getId())
                .employeeName(employee.getFullName())
                .month(month)
                .year(year)
                .totalDays(records.size())
                .presentDays(presentDays)
                .absentDays(absentDays)
                .lateDays(lateDays)
                .halfDays(halfDays)
                .totalHoursWorked(Math.round(totalHours * 100.0) / 100.0)
                .build();
    }

    private Employee getCurrentEmployee() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return employeeRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("Employee not found for current user"));
    }
}