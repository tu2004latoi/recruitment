package com.dtt.dto;

import com.dtt.model.Interview;
import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDateTime;

@Data
public class InterviewDTO {

    private Integer interviewId;

    private Integer userId;

    private Integer jobId;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    private LocalDateTime scheduledAt;

    private Integer locationId;

    private String notes;

    private Interview.Status status;
}
