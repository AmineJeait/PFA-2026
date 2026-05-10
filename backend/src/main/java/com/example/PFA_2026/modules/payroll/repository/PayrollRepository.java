package com.example.PFA_2026.modules.payroll.repository;

import com.example.PFA_2026.modules.payroll.entity.Payroll;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PayrollRepository extends JpaRepository<Payroll, Long> {

    List<Payroll> findByEmployeeId(Long employeeId);

    List<Payroll> findByMonthAndYear(int month, int year);

    Optional<Payroll> findByEmployeeIdAndMonthAndYear(Long employeeId, int month, int year);

    boolean existsByEmployeeIdAndMonthAndYear(Long employeeId, int month, int year);

    List<Payroll> findByStatus(Payroll.PayrollStatus status);
}