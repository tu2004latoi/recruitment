package com.dtt.controller;

import com.dtt.dto.ApplicationDTO;
import com.dtt.model.Applicant;
import com.dtt.model.Application;
import com.dtt.model.Job;
import com.dtt.model.User;
import com.dtt.service.ApplicantService;
import com.dtt.service.ApplicationService;
import com.dtt.service.JobService;
import com.dtt.service.UserService;
import org.checkerframework.checker.units.qual.A;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api")
public class ApiApplicationController {
    @Autowired
    private ApplicationService applicationService;

    @Autowired
    private ApplicantService applicantService;

    @Autowired
    private JobService jobService;

    @Autowired
    private UserService userService;

    @GetMapping("/applications")
    public ResponseEntity<List<Application>> getAllApplication(){
        return ResponseEntity.ok(this.applicationService.getAllApplication());
    }

    @GetMapping("/applications/{id}")
    public ResponseEntity<Application> getApplicationById(@PathVariable int id){
        return ResponseEntity.ok(this.applicationService.getApplicationById(id));
    }

    @GetMapping("/applications/my")
    public ResponseEntity<List<ApplicationDTO>> getMyApplication(Principal principal) {
        String username = principal.getName();
        User user = this.userService.getUserByUsername(username);

        List<Application> applications = this.applicationService.getApplicationByUSerApplicant(user);

        List<ApplicationDTO> applicationDTOs = applications.stream().map(app -> {
            ApplicationDTO dto = new ApplicationDTO();
            dto.setApplicationId(app.getApplicationId());
            dto.setUserId(app.getUser().getUserId());
            dto.setJobId(app.getJob().getJobId());
            dto.setAppliedAt(app.getAppliedAt());
            dto.setCoverLetter(app.getCoverLetter());
            dto.setStatus(app.getStatus());
            dto.setInterviewScheduleSent(app.getInterviewScheduleSent());
            return dto;
        }).toList();

        return ResponseEntity.ok(applicationDTOs);
    }


    @PostMapping("/applications/add")
    public ResponseEntity<Application> addApplication(@ModelAttribute ApplicationDTO applicationDTO){
        User user = this.userService.getUserById(applicationDTO.getUserId());
        Job job = this.jobService.getJobById(applicationDTO.getJobId());
        Application application = new Application();
        application.setUser(user);
        application.setJob(job);
        application.setCoverLetter(applicationDTO.getCoverLetter());
        application.setStatus(applicationDTO.getStatus());
        application.setAppliedAt(applicationDTO.getAppliedAt());
        application.setFile(applicationDTO.getFile());

        return ResponseEntity.ok(this.applicationService.addApplication(application));
    }

    @PatchMapping("/applications/{id}/update")
    public ResponseEntity<Application> updateApplication(@RequestBody ApplicationDTO applicationDTO){
        User user = this.userService.getUserById(applicationDTO.getUserId());
        Job job = this.jobService.getJobById(applicationDTO.getJobId());
        Application application = this.applicationService.getApplicationById(applicationDTO.getApplicationId());
        application.setUser(user);
        application.setJob(job);
        application.setStatus(applicationDTO.getStatus());
        application.setAppliedAt(applicationDTO.getAppliedAt());
        application.setInterviewScheduleSent(true);

        return ResponseEntity.ok(this.applicationService.updateApplication(application));
    }

    @PatchMapping("/applications/{id}/accepted")
    public ResponseEntity<ApplicationDTO> acceptedApplication(@PathVariable int id) {
        Application application = applicationService.getApplicationById(id);
        application.setStatus(Application.ApplicationStatus.ACCEPTED);
        application = applicationService.updateApplication(application);

        // Chuyển sang DTO trực tiếp tại đây
        ApplicationDTO dto = new ApplicationDTO();
        dto.setApplicationId(application.getApplicationId());
        dto.setUserId(application.getUser().getUserId());
        dto.setJobId(application.getJob().getJobId());
        dto.setAppliedAt(application.getAppliedAt());
        dto.setCoverLetter(application.getCoverLetter());
        dto.setStatus(application.getStatus());
        dto.setCv(application.getCv());

        return ResponseEntity.ok(dto);
    }

    @PatchMapping("/applications/{id}/rejected")
    public ResponseEntity<ApplicationDTO> rejectedApplication(@PathVariable int id) {
        Application application = applicationService.getApplicationById(id);
        application.setStatus(Application.ApplicationStatus.REJECTED);
        application = applicationService.updateApplication(application);

        // Chuyển sang DTO trực tiếp tại đây
        ApplicationDTO dto = new ApplicationDTO();
        dto.setApplicationId(application.getApplicationId());
        dto.setUserId(application.getUser().getUserId());
        dto.setJobId(application.getJob().getJobId());
        dto.setAppliedAt(application.getAppliedAt());
        dto.setCoverLetter(application.getCoverLetter());
        dto.setStatus(application.getStatus());
        dto.setCv(application.getCv());

        return ResponseEntity.ok(dto);
    }

    @PatchMapping("/applications/{id}/sent-interview")
    public ResponseEntity<ApplicationDTO> sentInterviewApplication(@PathVariable int id){
        Application application = applicationService.getApplicationById(id);
        application.setInterviewScheduleSent(true);
        application = applicationService.updateApplication(application);

        // Chuyển sang DTO trực tiếp tại đây
        ApplicationDTO dto = new ApplicationDTO();
        dto.setApplicationId(application.getApplicationId());
        dto.setUserId(application.getUser().getUserId());
        dto.setJobId(application.getJob().getJobId());
        dto.setAppliedAt(application.getAppliedAt());
        dto.setCoverLetter(application.getCoverLetter());
        dto.setStatus(application.getStatus());
        dto.setCv(application.getCv());

        return ResponseEntity.ok(dto);
    }


    @DeleteMapping("/applications/{id}/delete")
    public ResponseEntity<String> deleteApplication(@PathVariable int id){
        Application application = this.applicationService.getApplicationById(id);
        this.applicationService.deleteApplication(application);

        return ResponseEntity.ok("ok");
    }
}
