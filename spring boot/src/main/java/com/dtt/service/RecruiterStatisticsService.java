package com.dtt.service;

import com.dtt.model.Job;
import com.dtt.repository.ApplicationRepository;
import com.dtt.repository.JobRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class RecruiterStatisticsService {
    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    public Map<String, Long> getJobStatistics(Integer userId) {
        Map<String, Long> stats = new HashMap<>();

        stats.put("totalJobs", jobRepository.countByUser_UserId(userId));
        stats.put("activeJobs", jobRepository.countByUser_UserIdAndIsActiveTrue(userId));
        stats.put("totalViews", jobRepository.sumViewsByUser(userId) != null ? jobRepository.sumViewsByUser(userId) : 0);
        stats.put("featureJobs", jobRepository.countByUser_UserIdAndIsFeaturedTrue(userId));

        return stats;
    }

    public Map<String, Long> getApplicationStatistics(Integer userId){
        Map<String, Long> stats = new HashMap<>();

        stats.put("totalApplications", applicationRepository.countApplicationsByUser(userId));

        return stats;
    }
}
