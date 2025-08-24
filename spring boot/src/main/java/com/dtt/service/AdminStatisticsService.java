package com.dtt.service;

import com.dtt.model.Application;
import com.dtt.model.User;
import com.dtt.repository.ApplicationRepository;
import com.dtt.repository.JobRepository;
import com.dtt.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class AdminStatisticsService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    public Map<String, Long> getUserStatistics(){
        Map<String, Long> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("activeUsers", userRepository.countByIsActive(true));
        stats.put("inactiveUsers", userRepository.countByIsActive(false));
        stats.put("applicants", userRepository.countByRole(User.Role.APPLICANT));
        stats.put("recruiters", userRepository.countByRole(User.Role.RECRUITER));
        stats.put("moderators", userRepository.countByRole(User.Role.MODERATOR));
        stats.put("admins", userRepository.countByRole(User.Role.ADMIN));

        return stats;
    }

    public Map<String, Long> getJobStatistics(){
        Map<String, Long> stats = new HashMap<>();
        stats.put("totalJobs", jobRepository.count());
        stats.put("activeJobs", jobRepository.countByIsActive(true));
        stats.put("featuredJobs", jobRepository.countByIsFeatured(true));

        return stats;
    }
    public Map<String, Long> getApplicationStatistics(){
        Map<String, Long> stats = new HashMap<>();
        stats.put("totalApplication", applicationRepository.count());
        stats.put("acceptedApplications", applicationRepository.countByStatus(Application.ApplicationStatus.ACCEPTED));
        stats.put("rejectedApplications", applicationRepository.countByStatus(Application.ApplicationStatus.REJECTED));

        return stats;
    }
}
