package com.example.PFA_2026.modules.payroll.service;

import com.example.PFA_2026.modules.employee.entity.Employee;
import com.example.PFA_2026.modules.employee.repository.EmployeeRepository;
import com.example.PFA_2026.modules.payroll.dto.PayrollDto;
import com.example.PFA_2026.modules.payroll.entity.Payroll;
import com.example.PFA_2026.modules.payroll.repository.PayrollRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PayrollService {

    private final PayrollRepository payrollRepository;
    private final EmployeeRepository employeeRepository;

    // ─── Constants ─────────────────────────────────────────────────────────

    private static final BigDecimal CNSS_RATE        = new BigDecimal("0.0448");
    private static final BigDecimal CNSS_SALARY_CAP  = new BigDecimal("6000");
    private static final BigDecimal AMO_RATE         = new BigDecimal("0.0226");

    // ─── Generate Payroll ──────────────────────────────────────────────────

    @Transactional
    public PayrollDto.PayrollResponse generatePayroll(PayrollDto.GeneratePayrollRequest request) {
        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new EntityNotFoundException("Employee not found with id: " + request.getEmployeeId()));

        if (payrollRepository.existsByEmployeeIdAndMonthAndYear(
                request.getEmployeeId(), request.getMonth(), request.getYear())) {
            throw new IllegalStateException("Payroll already generated for this employee for "
                    + request.getMonth() + "/" + request.getYear());
        }

        if (employee.getBaseSalary() == null) {
            throw new IllegalStateException("Employee does not have a base salary set");
        }

        BigDecimal baseSalary  = employee.getBaseSalary();
        BigDecimal bonuses     = request.getBonuses() != null ? request.getBonuses() : BigDecimal.ZERO;
        BigDecimal deductions  = request.getDeductions() != null ? request.getDeductions() : BigDecimal.ZERO;

        BigDecimal cnss      = calculateCnss(baseSalary);
        BigDecimal amo       = calculateAmo(baseSalary);
        BigDecimal ir        = calculateIr(baseSalary, cnss, amo);
        BigDecimal netSalary = baseSalary.add(bonuses)
                .subtract(deductions)
                .subtract(cnss)
                .subtract(amo)
                .subtract(ir);

        Payroll payroll = Payroll.builder()
                .employee(employee)
                .month(request.getMonth())
                .year(request.getYear())
                .baseSalary(baseSalary)
                .bonuses(bonuses)
                .deductions(deductions)
                .cnss(cnss)
                .amo(amo)
                .ir(ir)
                .netSalary(netSalary)
                .build();

        return PayrollDto.PayrollResponse.fromEntity(payrollRepository.save(payroll));
    }

    // ─── Get All ───────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<PayrollDto.PayrollResponse> getAllPayrolls() {
        return payrollRepository.findAll()
                .stream()
                .map(PayrollDto.PayrollResponse::fromEntity)
                .toList();
    }

    // ─── Get by Employee ───────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<PayrollDto.PayrollResponse> getPayrollsByEmployee(Long employeeId) {
        if (!employeeRepository.existsById(employeeId)) {
            throw new EntityNotFoundException("Employee not found with id: " + employeeId);
        }
        return payrollRepository.findByEmployeeId(employeeId)
                .stream()
                .map(PayrollDto.PayrollResponse::fromEntity)
                .toList();
    }

    // ─── Get One ───────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public PayrollDto.PayrollResponse getPayrollById(Long id) {
        return PayrollDto.PayrollResponse.fromEntity(findPayrollOrThrow(id));
    }

    // ─── Validate ─────────────────────────────────────────────────────────

    @Transactional
    public PayrollDto.PayrollResponse validatePayroll(Long id) {
        Payroll payroll = findPayrollOrThrow(id);

        if (payroll.getStatus() != Payroll.PayrollStatus.BROUILLON) {
            throw new IllegalStateException("Only draft payrolls can be validated");
        }

        payroll.setStatus(Payroll.PayrollStatus.VALIDE);
        return PayrollDto.PayrollResponse.fromEntity(payrollRepository.save(payroll));
    }

    // ─── Mark as Paid ─────────────────────────────────────────────────────

    @Transactional
    public PayrollDto.PayrollResponse payPayroll(Long id) {
        Payroll payroll = findPayrollOrThrow(id);

        if (payroll.getStatus() != Payroll.PayrollStatus.VALIDE) {
            throw new IllegalStateException("Only validated payrolls can be marked as paid");
        }

        payroll.setStatus(Payroll.PayrollStatus.PAYE);
        payroll.setPaidAt(LocalDateTime.now());
        return PayrollDto.PayrollResponse.fromEntity(payrollRepository.save(payroll));
    }

    // ─── Moroccan Payroll Calculations ─────────────────────────────────────

    private BigDecimal calculateCnss(BigDecimal baseSalary) {
        // CNSS is capped: if salary > 6000, only 6000 is subject to CNSS
        BigDecimal taxableBase = baseSalary.min(CNSS_SALARY_CAP);
        return taxableBase.multiply(CNSS_RATE).setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal calculateAmo(BigDecimal baseSalary) {
        return baseSalary.multiply(AMO_RATE).setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal calculateIr(BigDecimal baseSalary, BigDecimal cnss, BigDecimal amo) {
        // Net taxable income = baseSalary - CNSS - AMO
        BigDecimal taxableIncome = baseSalary.subtract(cnss).subtract(amo);

        // Annual income for IR bracket calculation
        BigDecimal annualIncome = taxableIncome.multiply(BigDecimal.valueOf(12));

        BigDecimal annualIr = calculateAnnualIr(annualIncome);

        // Monthly IR
        return annualIr.divide(BigDecimal.valueOf(12), 2, RoundingMode.HALF_UP);
    }

    /**
     * Moroccan IR progressive tax brackets (annual):
     *   0        – 30 000   MAD  →  0%
     *   30 001   – 50 000   MAD  →  10%
     *   50 001   – 60 000   MAD  →  20%
     *   60 001   – 80 000   MAD  →  30%
     *   80 001   – 180 000  MAD  →  34%
     *   180 001+ MAD             →  38%
     */
    private BigDecimal calculateAnnualIr(BigDecimal annualIncome) {
        double income = annualIncome.doubleValue();
        double ir;

        if (income <= 30_000) {
            ir = 0;
        } else if (income <= 50_000) {
            ir = (income - 30_000) * 0.10;
        } else if (income <= 60_000) {
            ir = (50_000 - 30_000) * 0.10
                    + (income - 50_000) * 0.20;
        } else if (income <= 80_000) {
            ir = (50_000 - 30_000) * 0.10
                    + (60_000 - 50_000) * 0.20
                    + (income - 60_000) * 0.30;
        } else if (income <= 180_000) {
            ir = (50_000 - 30_000) * 0.10
                    + (60_000 - 50_000) * 0.20
                    + (80_000 - 60_000) * 0.30
                    + (income - 80_000) * 0.34;
        } else {
            ir = (50_000 - 30_000) * 0.10
                    + (60_000 - 50_000) * 0.20
                    + (80_000 - 60_000) * 0.30
                    + (180_000 - 80_000) * 0.34
                    + (income - 180_000) * 0.38;
        }

        return BigDecimal.valueOf(ir).setScale(2, RoundingMode.HALF_UP);
    }

    // ─── Helper ────────────────────────────────────────────────────────────

    private Payroll findPayrollOrThrow(Long id) {
        return payrollRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Payroll not found with id: " + id));
    }
}