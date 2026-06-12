package com.example.PFA_2026.modules.recruitment.service;

import com.example.PFA_2026.modules.department.entity.Department;
import com.example.PFA_2026.modules.department.entity.Position;
import com.example.PFA_2026.modules.department.repository.DepartmentRepository;
import com.example.PFA_2026.modules.department.repository.PositionRepository;
import com.example.PFA_2026.modules.recruitment.dto.RecruitmentDto;
import com.example.PFA_2026.modules.recruitment.entity.Application;
import com.example.PFA_2026.modules.recruitment.entity.JobOffer;
import com.example.PFA_2026.modules.recruitment.repository.ApplicationRepository;
import com.example.PFA_2026.modules.recruitment.repository.JobOfferRepository;
import com.example.PFA_2026.modules.employee.repository.EmployeeRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RecruitmentService {

    private final JobOfferRepository jobOfferRepository;
    private final ApplicationRepository applicationRepository;
    private final DepartmentRepository departmentRepository;
    private final PositionRepository positionRepository;
    private final EmployeeRepository employeeRepository;

    // ─── Job Offer ─────────────────────────────────────────────────────────

    @Transactional
    public RecruitmentDto.JobOfferResponse createJobOffer(RecruitmentDto.CreateJobOfferRequest request) {
        JobOffer jobOffer = JobOffer.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .requiredSkills(request.getRequiredSkills())
                .contractType(request.getContractType())
                .closingDate(request.getClosingDate())
                .build();

        if (request.getDepartmentId() != null) {
            Department department = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new EntityNotFoundException("Department not found with id: " + request.getDepartmentId()));
            jobOffer.setDepartment(department);
        }

        if (request.getPositionId() != null) {
            Position position = positionRepository.findById(request.getPositionId())
                    .orElseThrow(() -> new EntityNotFoundException("Position not found with id: " + request.getPositionId()));
            jobOffer.setPosition(position);
        }

        return RecruitmentDto.JobOfferResponse.fromEntity(jobOfferRepository.save(jobOffer));
    }

    @Transactional(readOnly = true)
    public List<RecruitmentDto.JobOfferResponse> getAllJobOffers() {
        return jobOfferRepository.findByStatus(JobOffer.JobStatus.OUVERT)
                .stream()
                .map(RecruitmentDto.JobOfferResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public RecruitmentDto.JobOfferResponse getJobOfferById(Long id) {
        return RecruitmentDto.JobOfferResponse.fromEntity(findJobOfferOrThrow(id));
    }

    @Transactional
    public RecruitmentDto.JobOfferResponse updateJobOffer(Long id, RecruitmentDto.UpdateJobOfferRequest request) {
        JobOffer jobOffer = findJobOfferOrThrow(id);

        jobOffer.setTitle(request.getTitle());
        jobOffer.setDescription(request.getDescription());
        jobOffer.setRequiredSkills(request.getRequiredSkills());
        jobOffer.setContractType(request.getContractType());
        jobOffer.setClosingDate(request.getClosingDate());

        if (request.getStatus() != null) {
            jobOffer.setStatus(request.getStatus());
        }

        if (request.getDepartmentId() != null) {
            Department department = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new EntityNotFoundException("Department not found with id: " + request.getDepartmentId()));
            jobOffer.setDepartment(department);
        } else {
            jobOffer.setDepartment(null);
        }

        if (request.getPositionId() != null) {
            Position position = positionRepository.findById(request.getPositionId())
                    .orElseThrow(() -> new EntityNotFoundException("Position not found with id: " + request.getPositionId()));
            jobOffer.setPosition(position);
        } else {
            jobOffer.setPosition(null);
        }

        return RecruitmentDto.JobOfferResponse.fromEntity(jobOfferRepository.save(jobOffer));
    }

    @Transactional
    public void deleteJobOffer(Long id) {
        JobOffer jobOffer = findJobOfferOrThrow(id);
        jobOfferRepository.delete(jobOffer);
    }

    // ─── Application ───────────────────────────────────────────────────────

    @Transactional
    public RecruitmentDto.ApplicationResponse applyToJob(Long jobOfferId, RecruitmentDto.CreateApplicationRequest request) {
        JobOffer jobOffer = findJobOfferOrThrow(jobOfferId);

        if (jobOffer.getStatus() != JobOffer.JobStatus.OUVERT) {
            throw new IllegalStateException("This job offer is no longer open for applications");
        }

        if (applicationRepository.existsByCandidateEmailAndJobOfferId(request.getCandidateEmail(), jobOfferId)) {
            throw new IllegalStateException("This candidate has already applied to this job offer");
        }

        Application application = Application.builder()
                .jobOffer(jobOffer)
                .candidateName(request.getCandidateName())
                .candidateEmail(request.getCandidateEmail())
                .candidatePhone(request.getCandidatePhone())
                .cvUrl(request.getCvUrl())
                .coverLetter(request.getCoverLetter())
                .build();

        return RecruitmentDto.ApplicationResponse.fromEntity(applicationRepository.save(application));
    }

    @Transactional(readOnly = true)
    public List<RecruitmentDto.ApplicationResponse> getApplicationsByJobOffer(Long jobOfferId) {
        findJobOfferOrThrow(jobOfferId); // ensure job offer exists
        return applicationRepository.findByJobOfferId(jobOfferId)
                .stream()
                .map(RecruitmentDto.ApplicationResponse::fromEntity)
                .toList();
    }

    @Transactional
    public RecruitmentDto.ApplicationResponse updateApplicationStatus(Long applicationId,
                                                                      RecruitmentDto.UpdateApplicationStatusRequest request) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new EntityNotFoundException("Application not found with id: " + applicationId));

        application.setStatus(request.getStatus());

        if (request.getNotes() != null) {
            application.setNotes(request.getNotes());
        }

        return RecruitmentDto.ApplicationResponse.fromEntity(applicationRepository.save(application));
    }

    @Transactional(readOnly = true)
    public List<RecruitmentDto.ApplicationResponse> getMyApplications() {
        String loginEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        // Resolve the employee's own email (may differ from login email)
        String candidateEmail = employeeRepository.findByUserEmail(loginEmail)
                .map(e -> e.getEmail())
                .orElse(loginEmail);
        return applicationRepository.findByCandidateEmail(candidateEmail)
                .stream()
                .map(RecruitmentDto.ApplicationResponse::fromEntity)
                .toList();
    }

    // ─── Helper ────────────────────────────────────────────────────────────

    private JobOffer findJobOfferOrThrow(Long id) {
        return jobOfferRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Job offer not found with id: " + id));
    }
}