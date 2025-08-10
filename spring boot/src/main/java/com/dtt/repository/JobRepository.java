package com.dtt.repository;

import com.dtt.model.Job;
import com.dtt.model.Recruiter;
import com.dtt.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobRepository extends JpaRepository<Job, Integer>, JpaSpecificationExecutor<Job> {
    List<Job> findByUser(User user);
}
