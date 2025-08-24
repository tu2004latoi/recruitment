package com.dtt.repository;

import com.dtt.model.Applicant;
import com.dtt.model.Education;
import com.dtt.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EducationRepository extends JpaRepository<Education, Integer> {
    List<Education> findByUser(User user);

    @Query("SELECT DISTINCT e.level.levelId FROM Education e WHERE e.user.userId = :userId AND e.level IS NOT NULL")
    List<Integer> findDistinctLevelIdsByUserId(@Param("userId") Integer userId);
}
