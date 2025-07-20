package com.dtt.service;

import com.dtt.model.Education;
import com.dtt.model.JobType;
import com.dtt.repository.EducationRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class EducationService {
    @Autowired
    private EducationRepository educationRepository;

    public List<Education> getAllEducation(){
        return this.educationRepository.findAll();
    }

    public Education getEducationById(int id){
        Optional<Education> education = this.educationRepository.findById(id);

        return education.orElse(null);
    }

    @Transactional
    public Education addEducation(Education education){
        if (education.getEducationId() != null){
            throw new IllegalArgumentException("New Education must not have an ID");
        }

        return this.educationRepository.save(education);
    }

    @Transactional
    public Education updateEducation(Education education){
        if (education.getEducationId() == null || !educationRepository.existsById(education.getEducationId())) {
            throw new EntityNotFoundException("Education not found with ID: " + education.getEducationId());
        }

        return educationRepository.save(education);
    }

    @Transactional
    public void deleteEducation(Education education){
        if (education == null){
            throw new IllegalArgumentException("Education not found");
        }

        this.educationRepository.delete(education);
    }
}
