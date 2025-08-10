package com.dtt.service;

import com.dtt.model.Institution;
import com.dtt.repository.InstitutionRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class InstitutionService {
    @Autowired
    private InstitutionRepository institutionRepository;

    public List<Institution> getAllInstitution(){
        return this.institutionRepository.findAll();
    }

    public Institution getInstitutionById(int id){
        Optional<Institution> institution = this.institutionRepository.findById(id);

        return institution.orElse(null);
    }

    @Transactional
    public Institution addInstitution(Institution institution){
        return this.institutionRepository.save(institution);
    }

    @Transactional
    public Institution updateInstitution(Institution institution){
        if (institution.getInstitutionId() == null || !institutionRepository.existsById(institution.getInstitutionId())) {
            throw new EntityNotFoundException("Institution not found with ID: " + institution.getInstitutionId());
        }

        return this.institutionRepository.save(institution);
    }

    @Transactional
    public void deleteInstitution(Institution institution){
        this.institutionRepository.delete(institution);
    }
}
