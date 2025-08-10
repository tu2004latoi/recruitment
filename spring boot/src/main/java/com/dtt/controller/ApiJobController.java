package com.dtt.controller;

import com.dtt.dto.ActivationDTO;
import com.dtt.dto.JobDTO;
import com.dtt.dto.ModeratorJobDTO;
import com.dtt.model.*;
import com.dtt.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ApiJobController {
    @Autowired
    private JobService jobService;

    @Autowired
    private LevelService levelService;

    @Autowired
    private JobIndustryService jobIndustryService;

    @Autowired
    private JobTypeService jobTypeService;

    @Autowired
    private RecruiterService recruiterService;

    @Autowired
    private ApplicationService applicationService;

    @Autowired
    private UserService userService;

    @Autowired
    private LocationService locationService;

    @GetMapping("/jobs")
    public ResponseEntity<Page<Job>> getJobs(
            @RequestParam(defaultValue = "0") int page
    ) {
        return ResponseEntity.ok(this.jobService.getJobs(page, 6));
    }

    @GetMapping("/jobs/search")
    public ResponseEntity<Page<Job>> searchJobs(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) Integer locationId,
            @RequestParam(required = false) Integer levelId,
            @RequestParam(required = false) Integer jobTypeId,
            @RequestParam(required = false) Integer industryId,
            @RequestParam(required = false) Integer salary,
            @RequestParam(required = false) Job.Status status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "6") int size
    ) {
        Page<Job> jobs = jobService.searchJobs(title, locationId, levelId, jobTypeId, industryId, salary, status, page, size);
        return ResponseEntity.ok(jobs);
    }

    @GetMapping("/jobs/{id}")
    public ResponseEntity<Job> getJobById(@PathVariable int id){
        return ResponseEntity.ok(this.jobService.getJobById(id));
    }

    @GetMapping("/jobs/{id}/applications")
    public ResponseEntity<List<Application>> getApplicationByJob(@PathVariable int id){
        Job job = this.jobService.getJobById(id);
        return ResponseEntity.ok(this.applicationService.getApplicationByJob(job));
    }

    @PostMapping("/jobs/add")
    public ResponseEntity<Job> addJob(@RequestBody JobDTO jobDTO){
        User user = this.userService.getUserById(jobDTO.getUserId());
        Level level = this.levelService.getLevelById(jobDTO.getLevelId());
        JobType jobType = this.jobTypeService.getJobTypeById(jobDTO.getJobTypeId());
        Location location = this.locationService.getLocationById(jobDTO.getLocationId());
        JobIndustry jobIndustry = this.jobIndustryService.getJobIndustryById(jobDTO.getIndustryId());
        Job job = new Job();
        job.setDescription(jobDTO.getDescription());
        job.setJobType(jobType);
        job.setLevel(level);
        job.setIndustry(jobIndustry);
        job.setExpiredAt(jobDTO.getExpiredAt());
        job.setQuantity(jobDTO.getQuantity());
        job.setLocation(location);
        job.setSalary(jobDTO.getSalary());
        job.setTitle(jobDTO.getTitle());
        job.setUser(user);
        job.setStatus(jobDTO.getStatus());
        job.setIsActive(jobDTO.getIsActive());
        job.setModerator(null);

        return ResponseEntity.ok(this.jobService.addJob(job));
    }

    @PatchMapping("/jobs/{id}/update")
    public ResponseEntity<Job> updateJob(@RequestBody JobDTO jobDTO){
        User user = this.userService.getUserById(jobDTO.getUserId());
        Location location = this.locationService.getLocationById(jobDTO.getLocationId());
        Level level = this.levelService.getLevelById(jobDTO.getLevelId());
        JobType jobType = this.jobTypeService.getJobTypeById(jobDTO.getJobTypeId());
        JobIndustry jobIndustry = this.jobIndustryService.getJobIndustryById(jobDTO.getIndustryId());
        Job job = this.jobService.getJobById(jobDTO.getJobTypeId());
        job.setDescription(jobDTO.getDescription());
        job.setJobType(jobType);
        job.setLevel(level);
        job.setIndustry(jobIndustry);
        job.setExpiredAt(jobDTO.getExpiredAt());
        job.setQuantity(jobDTO.getQuantity());
        job.setLocation(location);
        job.setSalary(jobDTO.getSalary());
        job.setTitle(jobDTO.getTitle());
        job.setUser(user);
        job.setStatus(jobDTO.getStatus());
        job.setIsActive(jobDTO.getIsActive());
        if (jobDTO.getModeratorId() != null) {
            User moderator = this.userService.getUserById(jobDTO.getModeratorId());
            job.setModerator(moderator);
        } else {
            job.setModerator(null);
        }

        return ResponseEntity.ok(this.jobService.updateJob(job));
    }

    @PatchMapping("/jobs/{id}/approved")
    public ResponseEntity<Job> approvedJob(@RequestBody ModeratorJobDTO moderatorJobDTO){
        Job job = this.jobService.getJobById(moderatorJobDTO.getJobId());
        User moderator = this.userService.getUserById(moderatorJobDTO.getModeratorId());
        job.setModerator(moderator);
        job.setStatus(Job.Status.APPROVED);

        return ResponseEntity.ok(this.jobService.updateJob(job));
    }

    @PatchMapping("/jobs/{id}/rejected")
    public ResponseEntity<Job> rejectedJob(@RequestBody ModeratorJobDTO moderatorJobDTO){
        Job job = this.jobService.getJobById(moderatorJobDTO.getJobId());
        User moderator = this.userService.getUserById(moderatorJobDTO.getModeratorId());
        job.setModerator(moderator);
        job.setStatus(Job.Status.REJECTED);

        return ResponseEntity.ok(this.jobService.updateJob(job));
    }

    @PatchMapping("/jobs/{id}/activation")
    public ResponseEntity<Job> activationJob(@RequestBody ActivationDTO activationDTO, @PathVariable int id){
        Job job = this.jobService.getJobById(id);
        job.setIsActive(activationDTO.getIsActive());

        return ResponseEntity.ok(this.jobService.updateJob(job));
    }

    @DeleteMapping("/jobs/{id}/delete")
    public ResponseEntity<String> deleteJob(@PathVariable int id){
        Job job = this.jobService.getJobById(id);
        this.jobService.deleteJob(job);
        return ResponseEntity.ok("ok");
    }
}
