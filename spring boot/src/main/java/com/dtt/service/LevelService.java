package com.dtt.service;

import com.dtt.model.Level;
import com.dtt.repository.LevelRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class LevelService {
    @Autowired
    private LevelRepository levelRepository;

    public List<Level> getAllLevel(){
        return this.levelRepository.findAll();
    }

    public Level getLevelById(int id){
        Optional<Level> level = this.levelRepository.findById(id);

        return level.orElse(null);
    }

    @Transactional
    public Level addLevel(Level level){
        return this.levelRepository.save(level);
    }

    @Transactional
    public Level updateLevel(Level level){
        if (level.getLevelId() == null || !levelRepository.existsById(level.getLevelId())) {
            throw new EntityNotFoundException("Education not found with ID: " + level.getLevelId());
        }

        return this.levelRepository.save(level);
    }

    @Transactional
    public void deleteLevel(Level level){
        this.levelRepository.delete(level);
    }
}
