package com.example.PFA_2026.modules.department.repository;

import com.example.PFA_2026.modules.department.entity.Position;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PositionRepository extends JpaRepository<Position, Long> {

    List<Position> findByDepartmentId(Long departmentId);

    boolean existsByTitleAndDepartmentId(String title, Long departmentId);
}