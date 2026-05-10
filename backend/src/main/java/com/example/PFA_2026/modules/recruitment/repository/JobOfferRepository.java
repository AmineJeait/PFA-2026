package com.example.PFA_2026.modules.recruitment.repository;

import com.example.PFA_2026.modules.recruitment.entity.JobOffer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobOfferRepository extends JpaRepository<JobOffer, Long> {

    List<JobOffer> findByStatus(JobOffer.JobStatus status);

    List<JobOffer> findByDepartmentId(Long departmentId);
}