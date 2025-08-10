package com.dtt.repository;

import com.dtt.model.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Integer> {
    List<Application> findByUser(User user);
    List<Application> findByJob(Job job);
    List<Application> findByJob_User(User user);
}
