package com.dtt.controller;

import com.dtt.dto.EducationDTO;
import com.dtt.model.*;
import com.dtt.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api")
public class ApiEducationController {
    @Autowired
    private EducationService educationService;

    @Autowired
    private LevelService levelService;

    @Autowired
    private InstitutionService institutionService;

    @Autowired
    private ApplicantService applicantService;

    @Autowired
    private UserService userService;

    @GetMapping("/educations")
    public ResponseEntity<List<Education>> getAllEducation(){
        return ResponseEntity.ok(this.educationService.getAllEducation());
    }

    @GetMapping("/educations/{id}")
    public ResponseEntity<Education> getEducationById(@PathVariable int id){
        return ResponseEntity.ok(this.educationService.getEducationById(id));
    }

    @PostMapping("/educations/add")
    public ResponseEntity<?> addEducations(@RequestBody List<EducationDTO> educationDTOs) {
        List<Education> savedEducations = new ArrayList<>();

        for (EducationDTO dto : educationDTOs) {
            Level level = this.levelService.getLevelById(dto.getLevelId());
            Institution institution = this.institutionService.getInstitutionById(dto.getInstitutionId());
            User user = this.userService.getUserById(dto.getUserId());

            Education education = new Education();
            education.setUser(user);
            education.setInstitution(institution);
            education.setLevel(level);
            education.setTitle(dto.getTitle());
            education.setYear(dto.getYear());

            this.educationService.addEducation(education);
            savedEducations.add(education);
        }

        return ResponseEntity.ok(savedEducations);
    }


    @PatchMapping("/educations/{id}/update")
    public ResponseEntity<Education> updateEducation(@RequestBody EducationDTO educationDTO, @PathVariable int id){
        Education education1 = this.educationService.getEducationById(id);
        User user = this.userService.getUserById(educationDTO.getUserId());
        Level level = this.levelService.getLevelById(educationDTO.getLevelId());
        Institution institution = this.institutionService.getInstitutionById(educationDTO.getInstitutionId());
        education1.setYear(educationDTO.getYear());
        education1.setLevel(level);
        education1.setInstitution(institution);
        education1.setTitle(educationDTO.getTitle());
        education1.setUser(user);

        return ResponseEntity.ok(this.educationService.updateEducation(education1));
    }

    @DeleteMapping("/educations/{id}/delete")
    public ResponseEntity<String> deleteEducation(@PathVariable int id){
        Education education = this.educationService.getEducationById(id);
        this.educationService.deleteEducation(education);

        return ResponseEntity.ok("ok");
    }
}
