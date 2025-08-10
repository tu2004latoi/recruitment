package com.dtt.service;

import com.dtt.model.Moderator;
import com.dtt.repository.ModeratorRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ModeratorService {
    @Autowired
    private ModeratorRepository moderatorRepository;

    public List<Moderator> getAllModerator(){
        return this.moderatorRepository.findAll();
    }

    public Moderator getModeratorById(int id){
        Optional<Moderator> moderator = this.moderatorRepository.findById(id);

        return moderator.orElse(null);
    }

    @Transactional
    public Moderator addModerator(Moderator moderator){
        if (moderator.getModeratorId() != null){
            throw new IllegalArgumentException("New Moderator must not have an ID");
        }

        return this.moderatorRepository.save(moderator);
    }

    @Transactional
    public Moderator updateModerator(Moderator moderator){
        if (moderator.getModeratorId() == null || !moderatorRepository.existsById(moderator.getModeratorId())) {
            throw new EntityNotFoundException("Moderator not found with ID: " + moderator.getModeratorId());
        }

        return this.moderatorRepository.save(moderator);
    }

    @Transactional
    public void deleteModerator(Moderator moderator){
        if (moderator == null){
            throw new EntityNotFoundException("Not found Moderator");
        }

        this.moderatorRepository.delete(moderator);
    }
}
