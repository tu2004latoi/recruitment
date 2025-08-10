package com.dtt.controller;

import com.dtt.dto.ApplicationDTO;
import com.dtt.dto.InterviewDTO;
import com.dtt.model.*;
import com.dtt.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api")
public class ApiInterviewController {
    @Autowired
    private InterviewService interviewService;

    @Autowired
    private ApplicationService applicationService;

    @Autowired
    private UserService userService;

    @Autowired
    private ApplicantService applicantService;

    @Autowired
    private LocationService locationService;

    @Autowired
    private JobService jobService;

    @GetMapping("/interviews")
    public ResponseEntity<List<Interview>> getAllInterview(){
        return ResponseEntity.ok(this.interviewService.getAllInterview());
    }

    @GetMapping("/interviews/{id}")
    public ResponseEntity<Interview> getInterviewById(@PathVariable int id){
        return ResponseEntity.ok(this.interviewService.getInterviewById(id));
    }

    @GetMapping("/interviews/my")
    public ResponseEntity<List<InterviewDTO>> getMyInterview(Principal principal) {
        String username = principal.getName();
        User user = this.userService.getUserByUsername(username);

        List<Interview> interviews = this.interviewService.getInterviewByUser(user);

        List<InterviewDTO> interviewDTOS = interviews.stream().map(i -> {
            InterviewDTO dto = new InterviewDTO();
            dto.setInterviewId(i.getInterviewId());
            dto.setUserId(i.getUser().getUserId());
            dto.setLocationId(i.getLocation().getLocationId());
            dto.setScheduledAt(i.getScheduledAt());
            dto.setNotes(i.getNotes());
            dto.setStatus(i.getStatus());
            dto.setJobId(i.getJob().getJobId());
            return dto;
        }).toList();

        return ResponseEntity.ok(interviewDTOS);
    }

    @PostMapping("/interviews/add")
    public ResponseEntity<Interview> addInterview(@RequestBody InterviewDTO interviewDTO){
        User user = this.userService.getUserById(interviewDTO.getUserId());
        Job job = this.jobService.getJobById(interviewDTO.getJobId());
        Location location = this.locationService.getLocationById(interviewDTO.getLocationId());
        Interview interview = new Interview();
        interview.setUser(user);
        interview.setLocation(location);
        interview.setStatus(interviewDTO.getStatus());
        interview.setNotes(interviewDTO.getNotes());
        interview.setScheduledAt(interviewDTO.getScheduledAt());
        interview.setJob(job);

        return ResponseEntity.ok(this.interviewService.addInterview(interview));
    }

    @PatchMapping("/interviews/{id}/update")
    public ResponseEntity<Interview> updateInterview(@RequestBody InterviewDTO interviewDTO){
        Interview interview = this.interviewService.getInterviewById(interviewDTO.getInterviewId());
        Location location = this.locationService.getLocationById(interviewDTO.getLocationId());
        interview.setLocation(location);
        interview.setStatus(interviewDTO.getStatus());
        interview.setNotes(interviewDTO.getNotes());
        interview.setScheduledAt(interviewDTO.getScheduledAt());

        return ResponseEntity.ok(this.interviewService.updateInterview(interview));
    }

    @DeleteMapping("/interviews/{id}/delete")
    public ResponseEntity<String> deleteInterview(@PathVariable int id){
        Interview interview = this.interviewService.getInterviewById(id);
        this.interviewService.deleteInterview(interview);

        return ResponseEntity.ok("ok");
    }
}
