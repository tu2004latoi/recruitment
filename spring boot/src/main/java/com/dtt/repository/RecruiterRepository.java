package com.dtt.repository;

import com.dtt.model.Recruiter;
import com.dtt.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RecruiterRepository extends JpaRepository<Recruiter, Integer> {
    Recruiter findByUser(User user);
}
