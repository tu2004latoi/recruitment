package com.dtt.controller;

import com.dtt.dto.ApplicationDTO;
import com.dtt.dto.RecruiterDTO;
import com.dtt.model.*;
import com.dtt.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class ApiRecruiterController {
    @Autowired
    private RecruiterService recruiterService;

    @Autowired
    private UserService userService;

    @Autowired
    private JobService jobService;

    @Autowired
    private ApplicationService applicationService;

    @Autowired
    private LocationService locationService;

    @GetMapping("/users/recruiters")
    public ResponseEntity<List<Recruiter>> getAllRecruiter(){
        return ResponseEntity.ok(this.recruiterService.getAllRecruiter());
    }

    @GetMapping("/users/recruiters/{id}")
    public ResponseEntity<Recruiter> getRecruiterById(@PathVariable int id){
        return ResponseEntity.ok(this.recruiterService.getRecruiterById(id));
    }

    @GetMapping("secure/recruiter/profile")
    public ResponseEntity<Recruiter> getRecruiterProfile(Principal principal){
        User user = this.userService.getUserByUsername(principal.getName());
        Recruiter recruiter = this.recruiterService.getRecruiterByUser(user);

        return ResponseEntity.ok(recruiter);
    }

    @GetMapping("/users/recruiters/{id}/jobs")
    public ResponseEntity<List<Job>> getJobByUser(@PathVariable int id){
        User user = this.userService.getUserById(id);
        return ResponseEntity.ok(this.jobService.getJobByUser(user));
    }

    @GetMapping("/users/recruiters/{recruiterId}/jobs/{jobId}")
    public ResponseEntity<Job> getJobDetailsByRecruiter(
            @PathVariable int recruiterId,
            @PathVariable int jobId) {


        Job job = jobService.getJobById(jobId);
        return ResponseEntity.ok(job);
    }

    @GetMapping("/users/recruiters/{id}/applications")
    public ResponseEntity<List<ApplicationDTO>> getApplicationByRecruiter(@PathVariable int id) {
        User user = userService.getUserById(id);
        List<Application> applications = applicationService.getApplicationByUserRecruiter(user);

        List<ApplicationDTO> applicationDTOs = applications.stream()
                .map(application -> {
                    ApplicationDTO dto = new ApplicationDTO();
                    dto.setApplicationId(application.getApplicationId());
                    dto.setUserId(application.getUser().getUserId());
                    dto.setJobId(application.getJob().getJobId());
                    dto.setAppliedAt(application.getAppliedAt());
                    dto.setCoverLetter(application.getCoverLetter());
                    dto.setStatus(application.getStatus());
                    dto.setCv(application.getCv());
                    dto.setInterviewScheduleSent(application.getInterviewScheduleSent());
                    return dto;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(applicationDTOs);
    }

    @PostMapping("/users/recruiters/add")
    public ResponseEntity<Recruiter> addRecruiter(@RequestBody RecruiterDTO recruiterDTO){
        User user = this.userService.getUserById(recruiterDTO.getUserId());
        Location location = this.locationService.getLocationById(recruiterDTO.getLocationId());
        Recruiter recruiter = new Recruiter();
        recruiter.setUser(user);
        recruiter.setCompanyName(recruiterDTO.getCompanyName());
        recruiter.setBio(recruiterDTO.getBio());
        recruiter.setLocation(location);
        recruiter.setPosition(recruiterDTO.getPosition());
        recruiter.setCompanyWebsite(recruiterDTO.getCompanyWebsite());
        recruiter.setLogoUrl(recruiterDTO.getLogoUrl());

        return ResponseEntity.ok(this.recruiterService.addRecruiter(recruiter));
    }

    @PatchMapping("/users/recruiters/{id}/update")
    public ResponseEntity<Recruiter> updateRecruiter(@PathVariable int id, @RequestBody RecruiterDTO recruiterDTO){
        User user = this.userService.getUserById(id);
        Location location = this.locationService.getLocationById(recruiterDTO.getLocationId());
        Recruiter recruiter = this.recruiterService.getRecruiterById(id);
        recruiter.setUser(user);
        recruiter.setBio(recruiterDTO.getBio());
        recruiter.setLocation(location);
        recruiter.setPosition(recruiterDTO.getPosition());
        recruiter.setCompanyName(recruiterDTO.getCompanyName());
        recruiter.setLogoUrl(recruiterDTO.getLogoUrl());
        recruiter.setCompanyWebsite(recruiterDTO.getCompanyWebsite());

        return ResponseEntity.ok(this.recruiterService.updateRecruiter(recruiter));
    }

    @PatchMapping("/secure/recruiter/profile/update")
    public ResponseEntity<Recruiter> updateRecruiterProfile(Principal principal, @RequestBody RecruiterDTO recruiterDTO){
        User user = this.userService.getUserByUsername(principal.getName());
        Location location = this.locationService.getLocationById(recruiterDTO.getLocationId());
        Recruiter recruiter = this.recruiterService.getRecruiterByUser(user);
        recruiter.setUser(user);
        recruiter.setBio(recruiterDTO.getBio());
        recruiter.setLocation(location);
        recruiter.setPosition(recruiterDTO.getPosition());
        recruiter.setCompanyName(recruiterDTO.getCompanyName());
        recruiter.setLogoUrl(recruiterDTO.getLogoUrl());
        recruiter.setCompanyWebsite(recruiterDTO.getCompanyWebsite());

        return ResponseEntity.ok(this.recruiterService.updateRecruiter(recruiter));
    }

    @DeleteMapping("/users/recruiters/{id}/delete")
    public ResponseEntity<String> deleteRecruiter(@PathVariable int id){
        Recruiter recruiter = this.recruiterService.getRecruiterById(id);
        this.recruiterService.deleteRecruiter(recruiter);

        return ResponseEntity.ok("ok");
    }
}
