package com.dtt.repository;

import com.dtt.model.Applicant;
import com.dtt.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ApplicantRepository extends JpaRepository<Applicant, Integer> {
    Applicant findByUser(User user);
}
