package com.dtt.controller;

import com.dtt.model.Applicant;
import com.dtt.model.User;
import com.dtt.service.ApplicantService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ApiApplicantController {
    @Autowired
    private ApplicantService applicantService;

    @GetMapping("/applicants")
    public ResponseEntity<List<Applicant>> getAllApplicant(){
        return ResponseEntity.ok(this.applicantService.getAllApplicant());
    }

    @GetMapping("/applicants/{id}")
    public ResponseEntity<Applicant> getApplicantById(@PathVariable int id){
        return ResponseEntity.ok(this.applicantService.getApplicantById(id));
    }

    @PostMapping("/register")
    public ResponseEntity<Applicant> registerApplicant(@RequestBody Applicant applicant){
        applicant.getUser().setRole(User.Role.APPLICANT);
        return ResponseEntity.ok(this.applicantService.addApplicant(applicant));
    }


}
