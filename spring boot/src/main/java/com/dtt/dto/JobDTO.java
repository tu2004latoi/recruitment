package com.dtt.dto;

import com.dtt.model.Job;
import lombok.Data;

import java.util.Date;

@Data
public class JobDTO {
    private Integer jobId;
    private Integer userId;
    private String title;
    private String description;
    private Integer locationId;
    private Integer levelId;
    private Integer salary;
    private Integer quantity;
    private Integer jobTypeId;
    private Integer industryId;
    private Date expiredAt;
    private Job.Status status;
    private Boolean isActive;
    private Integer moderatorId;
}
