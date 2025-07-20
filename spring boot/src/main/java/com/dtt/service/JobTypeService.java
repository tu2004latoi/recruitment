package com.dtt.service;

import com.dtt.model.JobType;
import com.dtt.repository.JobTypeRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class JobTypeService {
    @Autowired
    private JobTypeRepository jobTypeRepository;

    public List<JobType> getAllJobType(){
        return this.jobTypeRepository.findAll();
    }

    public JobType getJobTypeById(int id){
        Optional<JobType> jobType = this.jobTypeRepository.findById(id);

        return jobType.orElse(null);
    }

    @Transactional
    public JobType addJobType(JobType jobType){
        if (jobType.getJobTypeId() != null){
            throw new IllegalArgumentException("New JobType must not have an ID");
        }

        return this.jobTypeRepository.save(jobType);
    }

    @Transactional
    public JobType updateJobType(JobType jobType){
        if (jobType.getJobTypeId() == null || !jobTypeRepository.existsById(jobType.getJobTypeId())) {
            throw new EntityNotFoundException("JobType not found with ID: " + jobType.getJobTypeId());
        }

        return jobTypeRepository.save(jobType);
    }

    @Transactional
    public void deleteJobType(JobType jobType){
        if (jobType == null){
            throw new IllegalArgumentException("JobType not found");
        }

        this.jobTypeRepository.delete(jobType);
    }
}
