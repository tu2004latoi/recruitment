package com.dtt.service;

import com.dtt.model.Interview;
import com.dtt.model.InterviewLocation;
import com.dtt.repository.InterviewLocationRepositroy;
import com.dtt.repository.InterviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class InterviewLocationService {
    @Autowired
    private InterviewLocationRepositroy interviewLocationRepositroy;

    public List<InterviewLocation> getAllInterviewLocation(){
        return this.interviewLocationRepositroy.findAll();
    }

    public InterviewLocation getInterviewLocationById(int id){
        Optional<InterviewLocation> interviewLocation = this.interviewLocationRepositroy.findById(id);

        return interviewLocation.orElse(null);
    }


}
