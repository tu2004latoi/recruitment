package com.dtt.controller;

import com.dtt.dto.InstitutionDTO;
import com.dtt.model.Institution;
import com.dtt.service.InstitutionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ApiInstitutionController {
    @Autowired
    private InstitutionService institutionService;

    @GetMapping("/institutions")
    private ResponseEntity<List<Institution>> getAllInstitution(){
        return ResponseEntity.ok(this.institutionService.getAllInstitution());
    }

    @GetMapping("/institutions/{id}")
    private ResponseEntity<Institution> getInstitutionById(@PathVariable int id){
        return ResponseEntity.ok(this.institutionService.getInstitutionById(id));
    }

    @PostMapping("/institutions/add")
    private ResponseEntity<Institution> addInstitution(@RequestBody InstitutionDTO institutionDTO){
        Institution institution = new Institution();
        institution.setName(institutionDTO.getName());
        institution.setDomain(institutionDTO.getDomain());
        institution.setWebsite(institutionDTO.getWebsite());
        institution.setCountry(institutionDTO.getCountry());

        return ResponseEntity.ok(this.institutionService.addInstitution(institution));
    }

    @DeleteMapping("/institutions/{id}/delete")
    private ResponseEntity<String> deleteInstitution(@PathVariable int id){
        Institution institution = this.institutionService.getInstitutionById(id);
        this.institutionService.deleteInstitution(institution);

        return ResponseEntity.ok("ok");
    }
}
