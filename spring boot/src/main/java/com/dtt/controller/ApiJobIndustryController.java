package com.dtt.controller;

import com.dtt.model.JobIndustry;
import com.dtt.model.JobType;
import com.dtt.service.JobIndustryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ApiJobIndustryController {
    @Autowired
    private JobIndustryService jobIndustryService;

    @GetMapping("/job-industries")
    public ResponseEntity<List<JobIndustry>> getAllJobIndustry(){
        return ResponseEntity.ok(this.jobIndustryService.getAllJobIndustry());
    }

    @GetMapping("/job-industries/{id}")
    public ResponseEntity<JobIndustry> getJobIndustryById(@PathVariable int id){
        return ResponseEntity.ok(this.jobIndustryService.getJobIndustryById(id));
    }

    @PostMapping("/job-industries/add")
    public ResponseEntity<JobIndustry> addJobIndustry(@RequestBody JobIndustry jobIndustry){
        return ResponseEntity.ok(this.jobIndustryService.addJobIndustry(jobIndustry));
    }

    @PatchMapping("/job-industries/{id}/update")
    public ResponseEntity<JobIndustry> updateJobIndustry(@RequestBody JobIndustry jobIndustry, @PathVariable int id){
        jobIndustry.setIndustryId(id);
        return ResponseEntity.ok(this.jobIndustryService.updateJobIndustry(jobIndustry));
    }

    @DeleteMapping("/job-industries/{id}/delete")
    public ResponseEntity<String> deleteJobIndustry(@PathVariable int id){
        JobIndustry jobIndustry = this.jobIndustryService.getJobIndustryById(id);
        this.jobIndustryService.deleteJobIndustry(jobIndustry);

        return ResponseEntity.ok("ok");
    }
}
