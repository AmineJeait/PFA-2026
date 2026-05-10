package com.example.PFA_2026.modules.recruitment.repository;

import com.example.PFA_2026.modules.recruitment.entity.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {

    List<Application> findByJobOfferId(Long jobOfferId);

    List<Application> findByStatus(Application.ApplicationStatus status);

    boolean existsByCandidateEmailAndJobOfferId(String candidateEmail, Long jobOfferId);
}