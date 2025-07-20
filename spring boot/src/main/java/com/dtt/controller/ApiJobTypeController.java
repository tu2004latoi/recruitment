package com.dtt.controller;

import com.dtt.model.JobType;
import com.dtt.service.JobTypeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ApiJobTypeController {
    @Autowired
    private JobTypeService jobTypeService;

    @GetMapping("/job-types")
    public ResponseEntity<List<JobType>> getAllJobType(){
        return ResponseEntity.ok(this.jobTypeService.getAllJobType());
    }

    @GetMapping("/job-types/{id}")
    public ResponseEntity<JobType> getJobTypeById(@PathVariable int id){
        return ResponseEntity.ok(this.jobTypeService.getJobTypeById(id));
    }

    @PostMapping("/job-types/add")
    public ResponseEntity<JobType> addJobType(@RequestBody JobType jobType){
        return ResponseEntity.ok(this.jobTypeService.addJobType(jobType));
    }

    @PatchMapping("/job-types/{id}/update")
    public ResponseEntity<JobType> updateJobType(@RequestBody JobType jobType, @PathVariable int id){
        jobType.setJobTypeId(id);
        return ResponseEntity.ok(this.jobTypeService.updateJobType(jobType));
    }

    @DeleteMapping("/job-types/{id}/delete")
    public ResponseEntity<String> deleteJobType(@PathVariable int id){
        JobType jobType = this.jobTypeService.getJobTypeById(id);
        this.jobTypeService.deleteJobType(jobType);

        return ResponseEntity.ok("ok");
    }
}
