package com.dtt.controller;

import com.dtt.model.Education;
import com.dtt.model.JobType;
import com.dtt.service.EducationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ApiEducationController {
    @Autowired
    private EducationService educationService;

    @GetMapping("/educations")
    public ResponseEntity<List<Education>> getAllEducation(){
        return ResponseEntity.ok(this.educationService.getAllEducation());
    }

    @GetMapping("/educations/{id}")
    public ResponseEntity<Education> getEducationById(@PathVariable int id){
        return ResponseEntity.ok(this.educationService.getEducationById(id));
    }

    @PostMapping("/educations/add")
    public ResponseEntity<Education> addEducation(@RequestBody Education education){
        return ResponseEntity.ok(this.educationService.addEducation(education));
    }

    @PatchMapping("/educations/{id}/update")
    public ResponseEntity<Education> updateEducation(@RequestBody Education education, @PathVariable int id){
        education.setEducationId(id);
        return ResponseEntity.ok(this.educationService.updateEducation(education));
    }

    @DeleteMapping("/educations/{id}/delete")
    public ResponseEntity<String> deleteEducation(@PathVariable int id){
        Education education = this.educationService.getEducationById(id);
        this.educationService.deleteEducation(education);

        return ResponseEntity.ok("ok");
    }
}
