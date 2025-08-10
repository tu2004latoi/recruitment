package com.dtt.dto;

import com.dtt.model.Application;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;


@Data
public class ApplicationDTO {

    private Integer applicationId;
    private Integer userId;
    private Integer jobId;
    private LocalDateTime appliedAt;
    private String coverLetter;
    private Application.ApplicationStatus status;
    private String cv;
    private Boolean interviewScheduleSent;
    private MultipartFile file;
}

