package com.dtt.scheduler;

import com.dtt.service.JobService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class JobExpiredScheduler {
    @Autowired
    private JobService jobService;

    @Scheduled(fixedRate = 60000)
    public void updateJobExpired(){
        int updatedCount = this.jobService.deactivateExpiredJobs();
        if (updatedCount>0){
            System.out.print("Đã vô hiệu hóa " + updatedCount + "job hết hạn");
        }
    }
}
