package com.example.PFA_2026.modules.employee.service;

import com.example.PFA_2026.modules.auth.entity.User;
import com.example.PFA_2026.modules.auth.repository.UserRepository;
import com.example.PFA_2026.modules.employee.dto.EmployeeDto;
import com.example.PFA_2026.modules.employee.entity.Employee;
import com.example.PFA_2026.modules.employee.repository.EmployeeRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public EmployeeDto.Response create(EmployeeDto.CreateRequest request) {
        if (employeeRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email déjà utilisé");
        }

        // create user account automatically
        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(User.Role.valueOf(request.getRole().name()))
                .build();
        userRepository.save(user);

        // find manager if provided
        Employee manager = null;
        if (request.getManagerId() != null) {
            manager = employeeRepository.findById(request.getManagerId())
                    .orElseThrow(() -> new EntityNotFoundException("Manager non trouvé"));
        }

        Employee employee = Employee.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .cin(request.getCin())
                .dateOfBirth(request.getDateOfBirth())
                .address(request.getAddress())
                .hireDate(request.getHireDate())
                .status(request.getStatus())
                .contractType(request.getContractType())
                .baseSalary(request.getBaseSalary())
                .user(user)
                .manager(manager)
                .build();

        return EmployeeDto.Response.fromEntity(employeeRepository.save(employee));
    }

    public List<EmployeeDto.Response> getAll() {
        return employeeRepository.findAll()
                .stream()
                .map(EmployeeDto.Response::fromEntity)
                .toList();
    }

    public EmployeeDto.Response getById(Long id) {
        return EmployeeDto.Response.fromEntity(
                employeeRepository.findById(id)
                        .orElseThrow(() -> new EntityNotFoundException("Employé non trouvé"))
        );
    }

    public List<EmployeeDto.Response> search(String query) {
        return employeeRepository.search(query)
                .stream()
                .map(EmployeeDto.Response::fromEntity)
                .toList();
    }

    @Transactional
    public EmployeeDto.Response update(Long id, EmployeeDto.UpdateRequest request) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Employé non trouvé"));

        if (request.getFirstName() != null) employee.setFirstName(request.getFirstName());
        if (request.getLastName() != null) employee.setLastName(request.getLastName());
        if (request.getPhone() != null) employee.setPhone(request.getPhone());
        if (request.getCin() != null) employee.setCin(request.getCin());
        if (request.getDateOfBirth() != null) employee.setDateOfBirth(request.getDateOfBirth());
        if (request.getAddress() != null) employee.setAddress(request.getAddress());
        if (request.getStatus() != null) employee.setStatus(request.getStatus());
        if (request.getContractType() != null) employee.setContractType(request.getContractType());
        if (request.getBaseSalary() != null) employee.setBaseSalary(request.getBaseSalary());

        if (request.getManagerId() != null) {
            Employee manager = employeeRepository.findById(request.getManagerId())
                    .orElseThrow(() -> new EntityNotFoundException("Manager non trouvé"));
            employee.setManager(manager);
        }

        return EmployeeDto.Response.fromEntity(employeeRepository.save(employee));
    }

    @Transactional
    public void delete(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Employé non trouvé"));
        employeeRepository.delete(employee);
    }

    public EmployeeDto.Response getMe() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return EmployeeDto.Response.fromEntity(
                employeeRepository.findByUserEmail(email)
                        .orElseThrow(() -> new EntityNotFoundException("Employé non trouvé"))
        );
    }

    @Transactional
    public EmployeeDto.Response updateMe(EmployeeDto.UpdateMyProfileRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Employee employee = employeeRepository.findByUserEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("Employé non trouvé"));

        if (request.getPhone() != null)       employee.setPhone(request.getPhone());
        if (request.getAddress() != null)     employee.setAddress(request.getAddress());
        if (request.getDateOfBirth() != null) employee.setDateOfBirth(request.getDateOfBirth());
        if (request.getCin() != null)         employee.setCin(request.getCin());

        return EmployeeDto.Response.fromEntity(employeeRepository.save(employee));
    }
}