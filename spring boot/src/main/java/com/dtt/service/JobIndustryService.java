package com.dtt.service;

import com.dtt.model.JobIndustry;
import com.dtt.model.JobType;
import com.dtt.repository.JobIndustryRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class JobIndustryService {
    @Autowired
    private JobIndustryRepository jobIndustryRepository;

    public List<JobIndustry> getAllJobIndustry(){
        return this.jobIndustryRepository.findAll();
    }

    public JobIndustry getJobIndustryById(int id){
        Optional<JobIndustry> jobIndustry = this.jobIndustryRepository.findById(id);
        return jobIndustry.orElse(null);
    }

    @Transactional
    public JobIndustry addJobIndustry(JobIndustry jobIndustry){
        if (jobIndustry.getIndustryId() != null){
            throw new IllegalArgumentException("New JobIndustry must not have an ID");
        }

        return this.jobIndustryRepository.save(jobIndustry);
    }

    @Transactional
    public JobIndustry updateJobIndustry(JobIndustry jobIndustry){
        if (jobIndustry.getIndustryId() == null || !jobIndustryRepository.existsById(jobIndustry.getIndustryId())) {
            throw new EntityNotFoundException("JobIndustry not found with ID: " + jobIndustry.getIndustryId());
        }

        return this.jobIndustryRepository.save(jobIndustry);
    }

    @Transactional
    public void deleteJobIndustry(JobIndustry jobIndustry){
        if (jobIndustry == null){
            throw new IllegalArgumentException("JobIndustry not found");
        }

        this.jobIndustryRepository.delete(jobIndustry);
    }
}
