package com.example.PFA_2026.modules.department.service;

import com.example.PFA_2026.modules.department.dto.DepartmentDto;
import com.example.PFA_2026.modules.department.entity.Department;
import com.example.PFA_2026.modules.department.entity.Position;
import com.example.PFA_2026.modules.department.repository.DepartmentRepository;
import com.example.PFA_2026.modules.department.repository.PositionRepository;
import com.example.PFA_2026.modules.employee.entity.Employee;
import com.example.PFA_2026.modules.employee.repository.EmployeeRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final PositionRepository positionRepository;
    private final EmployeeRepository employeeRepository;

    // ─── Department ────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<DepartmentDto.DepartmentResponse> getAllDepartments() {
        return departmentRepository.findAll()
                .stream()
                .map(DepartmentDto.DepartmentResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public DepartmentDto.DepartmentResponse getDepartmentById(Long id) {
        Department department = findDepartmentOrThrow(id);
        return DepartmentDto.DepartmentResponse.fromEntity(department);
    }

    @Transactional
    public DepartmentDto.DepartmentResponse createDepartment(DepartmentDto.CreateDepartmentRequest request) {
        if (departmentRepository.existsByName(request.getName())) {
            throw new IllegalArgumentException("Department with name '" + request.getName() + "' already exists");
        }

        Department department = Department.builder()
                .name(request.getName())
                .description(request.getDescription())
                .build();

        if (request.getHeadEmployeeId() != null) {
            Employee head = findEmployeeOrThrow(request.getHeadEmployeeId());
            department.setHead(head);
        }

        return DepartmentDto.DepartmentResponse.fromEntity(departmentRepository.save(department));
    }

    @Transactional
    public DepartmentDto.DepartmentResponse updateDepartment(Long id, DepartmentDto.UpdateDepartmentRequest request) {
        Department department = findDepartmentOrThrow(id);

        if (!department.getName().equals(request.getName())
                && departmentRepository.existsByName(request.getName())) {
            throw new IllegalArgumentException("Department with name '" + request.getName() + "' already exists");
        }

        department.setName(request.getName());
        department.setDescription(request.getDescription());

        if (request.getHeadEmployeeId() != null) {
            Employee head = findEmployeeOrThrow(request.getHeadEmployeeId());
            department.setHead(head);
        } else {
            department.setHead(null); // explicitly remove head
        }

        return DepartmentDto.DepartmentResponse.fromEntity(departmentRepository.save(department));
    }

    @Transactional
    public void deleteDepartment(Long id) {
        Department department = findDepartmentOrThrow(id);

        if (!department.getEmployees().isEmpty()) {
            throw new IllegalStateException("Cannot delete department that still has employees");
        }

        departmentRepository.delete(department);
    }

    @Transactional(readOnly = true)
    public List<DepartmentDto.EmployeeInDepartmentResponse> getEmployeesInDepartment(Long id) {
        findDepartmentOrThrow(id); // ensure it exists
        return employeeRepository.findByDepartmentId(id)
                .stream()
                .map(DepartmentDto.EmployeeInDepartmentResponse::fromEntity)
                .toList();
    }

    // ─── Position ──────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<DepartmentDto.PositionResponse> getAllPositions() {
        return positionRepository.findAll()
                .stream()
                .map(DepartmentDto.PositionResponse::fromEntity)
                .toList();
    }

    @Transactional
    public DepartmentDto.PositionResponse createPosition(DepartmentDto.CreatePositionRequest request) {
        Department department = findDepartmentOrThrow(request.getDepartmentId());

        if (positionRepository.existsByTitleAndDepartmentId(request.getTitle(), request.getDepartmentId())) {
            throw new IllegalArgumentException(
                    "Position '" + request.getTitle() + "' already exists in this department");
        }

        Position position = Position.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .department(department)
                .build();

        return DepartmentDto.PositionResponse.fromEntity(positionRepository.save(position));
    }

    @Transactional
    public void deletePosition(Long id) {
        Position position = positionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Position not found with id: " + id));
        positionRepository.delete(position);
    }

    // ─── Helpers ───────────────────────────────────────────────────────────

    private Department findDepartmentOrThrow(Long id) {
        return departmentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Department not found with id: " + id));
    }

    private Employee findEmployeeOrThrow(Long id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Employee not found with id: " + id));
    }
}