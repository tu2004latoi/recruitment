package com.dtt.controller;

import com.dtt.dto.ApplicationDTO;
import com.dtt.dto.FavoriteJobDTO;
import com.dtt.model.*;
import com.dtt.service.ApplicantService;
import com.dtt.service.FavoriteJobService;
import com.dtt.service.JobService;
import com.dtt.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api")
public class ApiFavoriteJobController {
    @Autowired
    private FavoriteJobService favoriteJobService;

    @Autowired
    private ApplicantService applicantService;

    @Autowired
    private JobService jobService;

    @Autowired
    private UserService userService;

    @GetMapping("/favorites")
    public ResponseEntity<List<FavoriteJob>> getAllFavoriteJob(){
        return ResponseEntity.ok(this.favoriteJobService.getAllFavoriteJob());
    }

    @GetMapping("/favorites/{id}")
    public ResponseEntity<FavoriteJob> getFavoriteJobById(@PathVariable int id){
        return ResponseEntity.ok(this.favoriteJobService.getFavoriteJobById(id));
    }

    @GetMapping("/favorites/my")
    public ResponseEntity<List<FavoriteJobDTO>> getMyFavoriteJob(Principal principal) {
        String username = principal.getName();
        User user = this.userService.getUserByUsername(username);

        List<FavoriteJob> favoriteJobs = this.favoriteJobService.getFavoriteJobByUser(user);

        List<FavoriteJobDTO> favoriteJobDTOS = favoriteJobs.stream().map(fav -> {
            FavoriteJobDTO dto = new FavoriteJobDTO();
            dto.setFavoriteJobId(fav.getFavoriteJobId());
            dto.setUserId(fav.getUser().getUserId());
            dto.setJobId(fav.getJob().getJobId());
            dto.setFavoritedAt(fav.getFavoritedAt());
            return dto;
        }).toList();

        return ResponseEntity.ok(favoriteJobDTOS);
    }

    @PostMapping("/favorites/add")
    public ResponseEntity<FavoriteJob> addFavoriteJob(@RequestBody FavoriteJobDTO favoriteJobDTO){
        Job job = this.jobService.getJobById(favoriteJobDTO.getJobId());
        User user = this.userService.getUserById(favoriteJobDTO.getUserId());
        FavoriteJob favoriteJob = new FavoriteJob();
        favoriteJob.setJob(job);
        favoriteJob.setUser(user);
        favoriteJob.setFavoritedAt(favoriteJobDTO.getFavoritedAt());

        return ResponseEntity.ok(this.favoriteJobService.addFavoriteJob(favoriteJob));
    }

    @PatchMapping("/favorites/{id}/update")
    public ResponseEntity<FavoriteJob> updateFavoriteJob(@RequestBody FavoriteJobDTO favoriteJobDTO){
        FavoriteJob favoriteJob = this.favoriteJobService.getFavoriteJobById(favoriteJobDTO.getFavoriteJobId());
        favoriteJob.setFavoritedAt(favoriteJobDTO.getFavoritedAt());

        return ResponseEntity.ok(this.favoriteJobService.updateFavoriteJob(favoriteJob));
    }

    @DeleteMapping("/favorites/{id}/delete")
    public ResponseEntity<String> deleteFavoriteJob(@PathVariable int id){
        FavoriteJob favoriteJob = this.favoriteJobService.getFavoriteJobById(id);
        this.favoriteJobService.deleteFavoriteJob(favoriteJob);

        return ResponseEntity.ok("ok");
    }
}
