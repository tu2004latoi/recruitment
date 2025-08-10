package com.dtt.repository;

import com.dtt.model.Applicant;
import com.dtt.model.Interview;
import com.dtt.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InterviewRepository extends JpaRepository<Interview, Integer> {
    List<Interview> findByUser(User user);
}
