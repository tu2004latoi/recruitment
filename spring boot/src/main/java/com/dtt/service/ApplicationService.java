package com.dtt.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.dtt.model.*;
import com.dtt.repository.ApplicationRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.checkerframework.checker.units.qual.A;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.logging.Level;
import java.util.logging.Logger;

@Service
public class ApplicationService {
    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private Cloudinary cloudinary;

    public List<Application> getAllApplication(){
        return this.applicationRepository.findAll();
    }

    public Application getApplicationById(int id){
        Optional<Application> application = this.applicationRepository.findById(id);

        return application.orElse(null);
    }

    public List<Application> getApplicationByUSerApplicant(User user){
        return this.applicationRepository.findByUser(user);
    }

    public List<Application> getApplicationByJob(Job job){
        return this.applicationRepository.findByJob(job);
    }

    public List<Application> getApplicationByUserRecruiter(User user) { return this.applicationRepository.findByJob_User(user); }

    @Transactional
    public Application addApplication(Application application){
        if (application.getApplicationId() != null)
            throw new IllegalArgumentException("Application must have an ID");

        if (application.getFile() != null && !application.getFile().isEmpty()) {
            try {
                Map res = cloudinary.uploader().upload(application.getFile().getBytes(), ObjectUtils.asMap("resource_type", "auto"));
                application.setCv(res.get("secure_url").toString());
            } catch (IOException ex) {
                Logger.getLogger(ApplicationService.class.getName()).log(Level.SEVERE, null, ex);
            }
        }

        return this.applicationRepository.save(application);
    }

    @Transactional
    public Application updateApplication(Application application){
        if (application.getApplicationId()==null)
            throw new EntityNotFoundException("Application not found with ID");

        return this.applicationRepository.save(application);
    }

    @Transactional
    public void deleteApplication(Application application){
        this.applicationRepository.delete(application);
    }
}
