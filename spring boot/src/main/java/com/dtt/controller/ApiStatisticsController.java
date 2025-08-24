package com.dtt.controller;

import com.dtt.model.User;
import com.dtt.service.AdminStatisticsService;
import com.dtt.service.RecruiterStatisticsService;
import com.dtt.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.parameters.P;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ApiStatisticsController {
    @Autowired
    private AdminStatisticsService adminStatisticsService;

    @Autowired
    private RecruiterStatisticsService recruiterStatisticsService;

    @Autowired
    private UserService userService;

    @GetMapping("/admin/statistics/users")
    public Map<String, Long> getUserStatisticsAdmin(){
        return adminStatisticsService.getUserStatistics();
    }

    @GetMapping("/admin/statistics/jobs")
    public Map<String, Long> getJobStatisticsAdmin(){
        return adminStatisticsService.getJobStatistics();
    }

    @GetMapping("/admin/statistics/applications")
    public Map<String, Long> getApplicationStatisticsAdmin(){
        return adminStatisticsService.getApplicationStatistics();
    }

    @GetMapping("/recruiter/statistics/jobs")
    public Map<String, Long> getJobStatisticsRecruiter(Principal principal){
        String username = principal.getName();
        User user = this.userService.getUserByUsername(username);
        return recruiterStatisticsService.getJobStatistics(user.getUserId());
    }

    @GetMapping("/recruiter/statistics/applications")
    public Map<String, Long> getApplicationStatisticsRecruiter(Principal principal){
        String username = principal.getName();
        User user = this.userService.getUserByUsername(username);
        return recruiterStatisticsService.getApplicationStatistics(user.getUserId());
    }

}
