package com.dtt.service;

import com.dtt.model.Applicant;
import com.dtt.model.Recruiter;
import com.dtt.model.User;
import com.dtt.repository.ApplicantRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ApplicantService {
    @Autowired
    private ApplicantRepository applicantRepository;

    @Autowired
    private UserService userService;

    public List<Applicant> getAllApplicant(){
        return this.applicantRepository.findAll();
    }

    public Applicant getApplicantById(int id){
        Optional<Applicant> applicant = this.applicantRepository.findById(id);
        return applicant.orElse(null);
    }

    @Transactional
    public Applicant addApplicant(Applicant applicant){
        if (applicant.getApplicantId() != null){
            throw new IllegalArgumentException("New Applicant must not have an ID");
        }

        int userId = applicant.getUser().getUserId();

        User user = this.userService.getUserById(userId);
        applicant.setUser(user);

        return this.applicantRepository.save(applicant);
    }

    @Transactional
    public void deleteApplicant(Applicant applicant){
        if (applicant == null){
            throw new IllegalArgumentException("Applicant not found");
        }

        this.applicantRepository.delete(applicant);
    }
}
