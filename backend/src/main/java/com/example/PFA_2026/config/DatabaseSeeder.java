package com.example.PFA_2026.config;

import com.example.PFA_2026.modules.attendance.entity.Attendance;
import com.example.PFA_2026.modules.attendance.repository.AttendanceRepository;
import com.example.PFA_2026.modules.auth.entity.User;
import com.example.PFA_2026.modules.auth.repository.UserRepository;
import com.example.PFA_2026.modules.department.entity.Department;
import com.example.PFA_2026.modules.department.entity.Position;
import com.example.PFA_2026.modules.department.repository.DepartmentRepository;
import com.example.PFA_2026.modules.department.repository.PositionRepository;
import com.example.PFA_2026.modules.employee.entity.Employee;
import com.example.PFA_2026.modules.employee.repository.EmployeeRepository;
import com.example.PFA_2026.modules.leave.entity.LeaveRequest;
import com.example.PFA_2026.modules.leave.repository.LeaveRequestRepository;
import com.example.PFA_2026.modules.payroll.entity.Payroll;
import com.example.PFA_2026.modules.payroll.repository.PayrollRepository;
import com.example.PFA_2026.modules.recruitment.entity.Application;
import com.example.PFA_2026.modules.recruitment.entity.JobOffer;
import com.example.PFA_2026.modules.recruitment.repository.ApplicationRepository;
import com.example.PFA_2026.modules.recruitment.repository.JobOfferRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Transactional
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final PositionRepository positionRepository;
    private final EmployeeRepository employeeRepository;
    private final JobOfferRepository jobOfferRepository;
    private final ApplicationRepository applicationRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final AttendanceRepository attendanceRepository;
    private final PayrollRepository payrollRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.existsByEmail("admin@example.com")) {
            return;
        }

        User adminUser = createUser("admin@example.com", "Admin123!", User.Role.ADMIN);
        User hrUser = createUser("hr@example.com", "Hr123456!", User.Role.RH);
        User managerUser = createUser("manager@example.com", "Manager123!", User.Role.MANAGER);
        User employeeUser = createUser("employee@example.com", "Employee123!", User.Role.EMPLOYEE);

        userRepository.saveAll(List.of(adminUser, hrUser, managerUser, employeeUser));

        Department hrDepartment = Department.builder()
                .name("Human Resources")
                .description("Responsible for employee lifecycle, recruiting, and benefits administration.")
                .build();
        Department engDepartment = Department.builder()
                .name("Engineering")
                .description("Builds and maintains the company products and internal systems.")
                .build();
        Department salesDepartment = Department.builder()
                .name("Sales")
                .description("Drives customer acquisition and revenue for the business.")
                .build();

        departmentRepository.saveAll(List.of(hrDepartment, engDepartment, salesDepartment));

        Position hrManagerPosition = Position.builder()
                .title("HR Manager")
                .description("Leads HR operations, recruiting, and employee relations.")
                .department(hrDepartment)
                .build();
        Position softwareEngineerPosition = Position.builder()
                .title("Software Engineer")
                .description("Develops software solutions, writes tests, and participates in code reviews.")
                .department(engDepartment)
                .build();
        Position salesAssociatePosition = Position.builder()
                .title("Sales Associate")
                .description("Supports sales pipeline activities and customer engagement.")
                .department(salesDepartment)
                .build();

        positionRepository.saveAll(List.of(hrManagerPosition, softwareEngineerPosition, salesAssociatePosition));

        Employee hrHead = Employee.builder()
                .firstName("Hana")
                .lastName("Rashid")
                .email("hana.rashid@example.com")
                .phone("+212600000001")
                .hireDate(LocalDate.of(2021, 3, 15))
                .status(Employee.EmployeeStatus.ACTIF)
                .contractType(Employee.ContractType.CDI)
                .baseSalary(BigDecimal.valueOf(8500))
                .department(hrDepartment)
                .position(hrManagerPosition)
                .user(hrUser)
                .build();

        Employee engManager = Employee.builder()
                .firstName("Karim")
                .lastName("Benzak")
                .email("karim.benzak@example.com")
                .phone("+212600000002")
                .hireDate(LocalDate.of(2020, 5, 10))
                .status(Employee.EmployeeStatus.ACTIF)
                .contractType(Employee.ContractType.CDI)
                .baseSalary(BigDecimal.valueOf(10500))
                .department(engDepartment)
                .position(softwareEngineerPosition)
                .user(managerUser)
                .build();

        Employee staffEmployee = Employee.builder()
                .firstName("Yassine")
                .lastName("El Khatib")
                .email("yassine.elkhatib@example.com")
                .phone("+212600000003")
                .hireDate(LocalDate.of(2022, 8, 1))
                .status(Employee.EmployeeStatus.ACTIF)
                .contractType(Employee.ContractType.CDI)
                .baseSalary(BigDecimal.valueOf(7200))
                .department(engDepartment)
                .position(softwareEngineerPosition)
                .manager(engManager)
                .user(employeeUser)
                .build();

        employeeRepository.saveAll(List.of(hrHead, engManager, staffEmployee));

        hrDepartment.setHead(hrHead);
        engDepartment.setHead(engManager);
        departmentRepository.saveAll(List.of(hrDepartment, engDepartment));

        JobOffer backendJob = JobOffer.builder()
                .title("Backend Java Developer")
                .description("Join the engineering team to build and maintain Spring Boot backend services.")
                .department(engDepartment)
                .position(softwareEngineerPosition)
                .requiredSkills("Java, Spring Boot, JPA, REST APIs")
                .contractType(Employee.ContractType.CDI)
                .status(JobOffer.JobStatus.OUVERT)
                .closingDate(LocalDate.now().plusWeeks(4))
                .build();

        JobOffer hrAssistantJob = JobOffer.builder()
                .title("HR Assistant")
                .description("Support HR operations, recruiting follow-up, and employee onboarding.")
                .department(hrDepartment)
                .position(hrManagerPosition)
                .requiredSkills("Communication, coordination, HR policies")
                .contractType(Employee.ContractType.CDI)
                .status(JobOffer.JobStatus.OUVERT)
                .closingDate(LocalDate.now().plusWeeks(3))
                .build();

        jobOfferRepository.saveAll(List.of(backendJob, hrAssistantJob));

        Application backendApplication = Application.builder()
                .jobOffer(backendJob)
                .candidateName("Sara Haddad")
                .candidateEmail("sara.haddad@example.com")
                .candidatePhone("+212600000010")
                .cvUrl("https://example.com/cv/sara-haddad.pdf")
                .coverLetter("Experienced Java developer seeking a role on a collaborative engineering team.")
                .status(Application.ApplicationStatus.EN_COURS)
                .appliedAt(LocalDateTime.now().minusDays(5))
                .build();

        Application hrApplication = Application.builder()
                .jobOffer(hrAssistantJob)
                .candidateName("Nadia Azouzi")
                .candidateEmail("nadia.azouzi@example.com")
                .candidatePhone("+212600000011")
                .cvUrl("https://example.com/cv/nadia-azouzi.pdf")
                .coverLetter("Skilled HR coordinator with excellent interpersonal abilities.")
                .status(Application.ApplicationStatus.RECU)
                .appliedAt(LocalDateTime.now().minusDays(2))
                .build();

        applicationRepository.saveAll(List.of(backendApplication, hrApplication));

        LeaveRequest leaveRequest = LeaveRequest.builder()
                .employee(staffEmployee)
                .type(LeaveRequest.LeaveType.CONGE_PAYE)
                .startDate(LocalDate.now().plusWeeks(1))
                .endDate(LocalDate.now().plusWeeks(2))
                .reason("Family vacation and planned time off.")
                .status(LeaveRequest.LeaveStatus.EN_ATTENTE)
                .approvedBy(engManager)
                .approvedAt(LocalDateTime.now())
                .comments("Pending manager approval")
                .build();

        leaveRequestRepository.save(leaveRequest);

        Attendance attendanceDay1 = Attendance.builder()
                .employee(staffEmployee)
                .date(LocalDate.now().minusDays(2))
                .checkIn(LocalTime.of(9, 0))
                .checkOut(LocalTime.of(17, 30))
                .status(Attendance.AttendanceStatus.PRESENT)
                .hoursWorked(8.5)
                .notes("Completed sprint tasks.")
                .build();

        Attendance attendanceDay2 = Attendance.builder()
                .employee(staffEmployee)
                .date(LocalDate.now().minusDays(1))
                .checkIn(LocalTime.of(9, 15))
                .checkOut(LocalTime.of(17, 15))
                .status(Attendance.AttendanceStatus.RETARD)
                .hoursWorked(8.0)
                .notes("Delayed start due to transit.")
                .build();

        attendanceRepository.saveAll(List.of(attendanceDay1, attendanceDay2));

        Payroll payroll = Payroll.builder()
                .employee(staffEmployee)
                .month(LocalDate.now().getMonthValue())
                .year(LocalDate.now().getYear())
                .baseSalary(BigDecimal.valueOf(7200))
                .bonuses(BigDecimal.valueOf(450))
                .deductions(BigDecimal.valueOf(120))
                .cnss(BigDecimal.valueOf(323.04))
                .amo(BigDecimal.valueOf(162.72))
                .ir(BigDecimal.valueOf(210.00))
                .netSalary(BigDecimal.valueOf(6817.28))
                .status(Payroll.PayrollStatus.VALIDE)
                .paidAt(LocalDateTime.now().minusDays(3))
                .build();

        payrollRepository.save(payroll);
    }

    private User createUser(String email, String rawPassword, User.Role role) {
        return User.builder()
                .email(email)
                .password(passwordEncoder.encode(rawPassword))
                .role(role)
                .build();
    }
}
