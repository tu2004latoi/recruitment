package com.dtt.service;

import com.dtt.model.Applicant;
import com.dtt.model.Interview;
import com.dtt.model.User;
import com.dtt.repository.InterviewRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class InterviewService {
    @Autowired
    private InterviewRepository interviewRepository;

    public List<Interview> getAllInterview(){
        return this.interviewRepository.findAll();
    }

    public Interview getInterviewById(int id){
        Optional<Interview> interview = this.interviewRepository.findById(id);

        return interview.orElse(null);
    }

    public List<Interview> getInterviewByUser(User user){
        return this.interviewRepository.findByUser(user);
    }

    @Transactional
    public Interview addInterview(Interview interview){
        if (interview.getInterviewId() != null)
            throw new IllegalArgumentException("Interview must have an ID");

        return this.interviewRepository.save(interview);
    }

    @Transactional
    public Interview updateInterview(Interview interview){
        if (interview.getInterviewId() == null)
            throw new EntityNotFoundException("Not found Interview with ID");

        return this.interviewRepository.save(interview);
    }

    @Transactional
    public void deleteInterview(Interview interview){
        if (interview.getInterviewId() == null)
            throw new EntityNotFoundException("Not found Interview with ID");

        this.interviewRepository.delete(interview);
    }
}
