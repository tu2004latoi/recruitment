package com.dtt.controller;

import com.dtt.dto.ApplicantDTO;
import com.dtt.dto.ApplicationDTO;
import com.dtt.model.*;
import com.dtt.service.*;
import org.checkerframework.checker.units.qual.A;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api")
public class ApiApplicantController {
    @Autowired
    private ApplicantService applicantService;

    @Autowired
    private UserService userService;

    @Autowired
    private EducationService educationService;

    @Autowired
    private ApplicationService applicationService;

    @Autowired
    private FavoriteJobService favoriteJobService;

    @Autowired
    private LocationService locationService;

    @GetMapping("/users/applicants")
    public ResponseEntity<List<Applicant>> getAllApplicant(){
        return ResponseEntity.ok(this.applicantService.getAllApplicant());
    }

    @GetMapping("/users/applicants/{id}")
    public ResponseEntity<Applicant> getApplicantById(@PathVariable int id){
        return ResponseEntity.ok(this.applicantService.getApplicantById(id));
    }

    @GetMapping("/secure/applicant/profile")
    public ResponseEntity<Applicant> getApplicantProfile(Principal principal){
        User user = this.userService.getUserByUsername(principal.getName());
        Applicant applicant = this.applicantService.getApplicantByUser(user);

        return ResponseEntity.ok(applicant);
    }

    @GetMapping("/secure/applicant/profile/educations")
    public ResponseEntity<List<Education>> getEducationByApplicantProfile(Principal principal){
        User user = this.userService.getUserByUsername(principal.getName());
        return ResponseEntity.ok(this.educationService.getEducationByUser(user));
    }

    @GetMapping("/users/applicants/{id}/educations")
    public ResponseEntity<List<Education>> getEducationByApplicantId(@PathVariable int id){
        User user = this.userService.getUserById(id);
        return ResponseEntity.ok(this.educationService.getEducationByUser(user));
    }

    @GetMapping("/users/applicants/{id}/applications")
    public ResponseEntity<List<Application>> getApplicationByApplicant(@PathVariable int id){
        User user = this.userService.getUserById(id);
        return ResponseEntity.ok(this.applicationService.getApplicationByUSerApplicant(user));
    }

    @GetMapping("/users/applicants/{id}/favorites")
    public ResponseEntity<List<FavoriteJob>> getFavoriteJobByApplicant(@PathVariable int id){
        User user = this.userService.getUserById(id);
        return ResponseEntity.ok(this.favoriteJobService.getFavoriteJobByUser(user));
    }

    @PostMapping("/users/applicants/add")
    public ResponseEntity<Applicant> addApplicant(@RequestBody ApplicantDTO applicantDTO){
        User user = this.userService.getUserById(applicantDTO.getUserId());
        Location location = this.locationService.getLocationById(applicantDTO.getLocationId());
        Applicant applicant = new Applicant();
        applicant.setUser(user);
        applicant.setDob(applicantDTO.getDob());
        applicant.setLocation(location);
        applicant.setSkills(applicantDTO.getSkills());
        applicant.setGender(applicantDTO.getGender());
        applicant.setJobTitle(applicantDTO.getJobTitle());
        applicant.setExperienceYears(applicantDTO.getExperienceYears());
        applicant.setBio(applicantDTO.getBio());

        return ResponseEntity.ok(this.applicantService.addApplicant(applicant));
    }

    @PatchMapping("/users/applicants/{id}/update")
    public ResponseEntity<Applicant> updateApplicant(@PathVariable int id, @RequestBody ApplicantDTO applicantDTO){
        User user = this.userService.getUserById(id);
        Location location = this.locationService.getLocationById(applicantDTO.getLocationId());
        Applicant applicant = this.applicantService.getApplicantById(id);
        applicant.setUser(user);
        applicant.setDob(applicantDTO.getDob());
        applicant.setLocation(location);
        applicant.setSkills(applicantDTO.getSkills());
        applicant.setGender(applicantDTO.getGender());
        applicant.setJobTitle(applicantDTO.getJobTitle());
        applicant.setExperienceYears(applicantDTO.getExperienceYears());
        applicant.setBio(applicantDTO.getBio());

        return ResponseEntity.ok(this.applicantService.updateApplicant(applicant));
    }

    @PatchMapping("/secure/applicant/profile/update")
    public ResponseEntity<Applicant> updateApplicantProfile(Principal principal, @RequestBody ApplicantDTO applicantDTO){
        User user = this.userService.getUserByUsername(principal.getName());
        Location location = this.locationService.getLocationById(applicantDTO.getLocationId());
        Applicant applicant = this.applicantService.getApplicantByUser(user);
        applicant.setUser(user);
        applicant.setDob(applicantDTO.getDob());
        applicant.setLocation(location);
        applicant.setSkills(applicantDTO.getSkills());
        applicant.setGender(applicantDTO.getGender());
        applicant.setJobTitle(applicantDTO.getJobTitle());
        applicant.setExperienceYears(applicantDTO.getExperienceYears());
        applicant.setBio(applicantDTO.getBio());

        return ResponseEntity.ok(this.applicantService.updateApplicant(applicant));
    }

    @DeleteMapping("users/applicants/{id}/delete")
    public ResponseEntity<String> deleteApplicant(@PathVariable int id){
        Applicant applicant = this.applicantService.getApplicantById(id);
        this.applicantService.deleteApplicant(applicant);

        return ResponseEntity.ok("ok");
    }

}
