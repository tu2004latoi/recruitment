package com.dtt.controller;

import com.dtt.dto.LevelDTO;
import com.dtt.model.Level;
import com.dtt.service.LevelService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ApiLevelController {
    @Autowired
    private LevelService levelService;

    @GetMapping("/levels")
    private ResponseEntity<List<Level>> getAllLevel(){
        return ResponseEntity.ok(this.levelService.getAllLevel());
    }

    @GetMapping("/levels/{id}")
    private ResponseEntity<Level> getLevelById(@PathVariable int id){
        return ResponseEntity.ok(this.levelService.getLevelById(id));
    }

    @PostMapping("/levels/add")
    private ResponseEntity<Level> addLevel(@RequestBody LevelDTO levelDTO){
        Level level = new Level();
        level.setDescription(levelDTO.getDescription());
        level.setName(levelDTO.getName());

        return ResponseEntity.ok(this.levelService.addLevel(level));
    }

    @DeleteMapping("/levels/{id}/delete")
    private ResponseEntity<String> deleteLevel(@PathVariable int id){
        Level level = this.levelService.getLevelById(id);
        this.levelService.deleteLevel(level);

        return ResponseEntity.ok("ok");
    }
}
