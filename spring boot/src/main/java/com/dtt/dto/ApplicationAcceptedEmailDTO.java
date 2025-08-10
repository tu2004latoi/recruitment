package com.dtt.dto;

import lombok.Data;

@Data
public class ApplicationAcceptedEmailDTO {

    private String to;
    private String applicantName;
    private String title;
}