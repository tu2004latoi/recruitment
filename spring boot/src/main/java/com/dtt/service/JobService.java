package com.dtt.service;

import com.dtt.model.Job;
import com.dtt.model.Recruiter;
import com.dtt.model.User;
import com.dtt.repository.EducationRepository;
import com.dtt.repository.JobRepository;
import com.dtt.specification.JobSpecification;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class JobService {
    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private EducationRepository educationRepository;

    public List<Job> getAllJob(){
        return this.jobRepository.findAll();
    }

    public Page<Job> getJobs(int page, int size){
        Pageable pageable = PageRequest.of(page, size, Sort.by("jobId").descending());
        return jobRepository.findAll(pageable);
    }

    public Page<Job> searchJobs(
            String title,
            Integer locationId,
            Integer levelId,
            Integer jobTypeId,
            Integer industryId,
            Integer salary,
            Job.Status status,
            Boolean isFeatured,
            Integer minViews,
            Integer minApplications,
            int page,
            int size,
            String sortBy,       // thêm tham số sortBy
            String sortDirection // thêm tham số sortDirection ("asc" hoặc "desc")
    ) {
        Specification<Job> spec = Specification.allOf(
                JobSpecification.hasTitle(title),
                JobSpecification.hasLocation(locationId),
                JobSpecification.hasLevel(levelId),
                JobSpecification.hasJobType(jobTypeId),
                JobSpecification.hasIndustry(industryId),
                JobSpecification.salaryGreaterThanOrEqual(salary),
                JobSpecification.hasStatus(status),
                JobSpecification.isFeatured(isFeatured),
                JobSpecification.viewsCountGreaterThanOrEqual(minViews),
                JobSpecification.applicationCountGreaterThanOrEqual(minApplications)
        );

        Sort.Direction direction = "asc".equalsIgnoreCase(sortDirection) ? Sort.Direction.ASC : Sort.Direction.DESC;

        // Mặc định nếu sortBy null hoặc rỗng thì sort theo createdAt
        String sortField = (sortBy == null || sortBy.isEmpty()) ? "createdAt" : sortBy;

        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortField));
        return jobRepository.findAll(spec, pageable);
    }

    public Page<Job> findJobsByApplicantLevel(Integer userId, int page, int size) {
        List<Integer> levelIds = educationRepository.findDistinctLevelIdsByUserId(userId);

        Specification<Job> spec = null;

        if (levelIds != null && !levelIds.isEmpty()) {
            spec = JobSpecification.hasLevelIn(levelIds);
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        return jobRepository.findAll(spec, pageable);
    }


    public Job getJobById(int id){
        Optional<Job> job = this.jobRepository.findById(id);
        return job.orElse(null);
    }

    public List<Job> getJobByUser(User user){
        List<Job> list = this.jobRepository.findByUser(user);
        return list;
    }

    @Transactional
    public int deactivateExpiredJobs(){
        return jobRepository.deactivateExpiredJobs();
    }

    @Transactional
    public int updateFeaturedJobs(){
        return this.jobRepository.markFeaturedJobs();
    }

    @Transactional
    public Job addJob(Job job){
        if (job.getJobId()!=null){
            throw new IllegalArgumentException("New Job must not have an ID");
        }

        return this.jobRepository.save(job);
    }

    @Transactional
    public Job updateJob(Job job){
        if (job.getJobId()==null){
            throw new EntityNotFoundException("Job not found with ID: " + job.getJobId());
        }

        return this.jobRepository.save(job);
    }

    @Transactional
    public void deleteJob(Job job){
        if (job==null){
            throw new IllegalArgumentException("Job not found");
        }

        this.jobRepository.delete(job);
    }
}
