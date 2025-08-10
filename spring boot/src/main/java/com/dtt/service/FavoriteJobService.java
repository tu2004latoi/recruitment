package com.dtt.service;

import com.dtt.model.Applicant;
import com.dtt.model.FavoriteJob;
import com.dtt.model.User;
import com.dtt.repository.FavoriteJobRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class FavoriteJobService {
    @Autowired
    private FavoriteJobRepository favoriteJobRepository;

    public List<FavoriteJob> getAllFavoriteJob(){
        return this.favoriteJobRepository.findAll();
    }

    public FavoriteJob getFavoriteJobById(int id){
        Optional<FavoriteJob> favoriteJob = this.favoriteJobRepository.findById(id);
        return favoriteJob.orElse(null);
    }

    public List<FavoriteJob> getFavoriteJobByUser(User user){
        return this.favoriteJobRepository.findByUser(user);
    }

    @Transactional
    public FavoriteJob addFavoriteJob(FavoriteJob favoriteJob){
        if (favoriteJob.getFavoriteJobId() != null)
            throw new IllegalArgumentException("FavoriteJob must have an ID");

        return this.favoriteJobRepository.save(favoriteJob);
    }

    @Transactional
    public FavoriteJob updateFavoriteJob(FavoriteJob favoriteJob){
        if (favoriteJob.getFavoriteJobId()==null)
            throw new EntityNotFoundException("FavoriteJob not found with ID");

        return this.favoriteJobRepository.save(favoriteJob);
    }

    @Transactional
    public void deleteFavoriteJob(FavoriteJob favoriteJob){
        this.favoriteJobRepository.delete(favoriteJob);
    }
}
