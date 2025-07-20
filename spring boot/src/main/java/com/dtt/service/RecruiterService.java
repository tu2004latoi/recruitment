package com.dtt.service;

import com.dtt.model.Admin;
import com.dtt.model.Recruiter;
import com.dtt.model.User;
import com.dtt.repository.RecruiterRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class RecruiterService {
    @Autowired
    private RecruiterRepository recruiterRepository;

    @Autowired
    private UserService userService;

    public List<Recruiter> getAllRecruiter(){
        return this.recruiterRepository.findAll();
    }

    public Recruiter getRecruiterById(int id){
        Optional<Recruiter> recruiter = this.recruiterRepository.findById(id);
        return recruiter.orElse(null);
    }

    @Transactional
    public Recruiter addRecruiter(Recruiter recruiter){
        if (recruiter.getRecruiterId() != null){
            throw new IllegalArgumentException("New Recruiter must not have an ID");
        }

        int userId = recruiter.getUser().getUserId();

        User user = this.userService.getUserById(userId);
        recruiter.setUser(user);

        return this.recruiterRepository.save(recruiter);
    }

    @Transactional
    public void deleteRecruiter(Recruiter recruiter){
        if (recruiter == null){
            throw new IllegalArgumentException("Recruiter not found");
        }

        this.recruiterRepository.delete(recruiter);
    }
}
