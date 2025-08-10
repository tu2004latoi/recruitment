package com.dtt.repository;

import com.dtt.model.InterviewLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InterviewLocationRepositroy extends JpaRepository<InterviewLocation, Integer> {
}
