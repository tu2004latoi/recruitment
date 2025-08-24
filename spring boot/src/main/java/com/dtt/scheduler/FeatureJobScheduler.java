package com.dtt.scheduler;

import com.dtt.service.JobService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class FeatureJobScheduler {
    @Autowired
    private JobService jobService;

    @Scheduled(fixedRate = 86400000)
    public void updateFeatureJob(){
        int updateCount = this.jobService.updateFeaturedJobs();
        if (updateCount>0){
            System.out.print("Da cap nhat " + updateCount + " job noi bat");
        }
    }
}
