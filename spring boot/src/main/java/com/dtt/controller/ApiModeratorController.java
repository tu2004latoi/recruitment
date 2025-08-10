package com.dtt.controller;

import com.dtt.dto.ModeratorDTO;
import com.dtt.model.Moderator;
import com.dtt.model.User;
import com.dtt.service.ModeratorService;
import com.dtt.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ApiModeratorController {
    @Autowired
    private ModeratorService moderatorService;

    @Autowired
    private UserService userService;

    @GetMapping("/users/moderators")
    public ResponseEntity<List<Moderator>> getAllModerator(){
        return ResponseEntity.ok(this.moderatorService.getAllModerator());
    }

    @GetMapping("/users/moderators/{id}")
    public ResponseEntity<Moderator> getModeratorById(@PathVariable int id){
        return ResponseEntity.ok(this.moderatorService.getModeratorById(id));
    }

    @PostMapping("/users/moderators/add")
    public ResponseEntity<Moderator> addModerator(@RequestBody ModeratorDTO moderatorDTO){
        User user = this.userService.getUserById(moderatorDTO.getUserId());
        Moderator moderator = new Moderator();
        moderator.setUser(user);

        return ResponseEntity.ok(this.moderatorService.addModerator(moderator));
    }

    @PatchMapping("/users/moderators/{id}/update")
    public ResponseEntity<Moderator> updateModerator(@RequestBody ModeratorDTO moderatorDTO){
        User user = this.userService.getUserById(moderatorDTO.getUserId());
        Moderator moderator = this.moderatorService.getModeratorById(moderatorDTO.getModeratorId());
        moderator.setUser(user);

        return ResponseEntity.ok(this.moderatorService.updateModerator(moderator));
    }

    @DeleteMapping("/users/moderators/{id}/delete")
    public ResponseEntity<String> deleteModerator(@PathVariable int id){
        Moderator moderator = this.moderatorService.getModeratorById(id);
        this.moderatorService.deleteModerator(moderator);

        return ResponseEntity.ok("ok");
    }
}
