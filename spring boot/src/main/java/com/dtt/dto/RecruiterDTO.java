package com.dtt.dto;

import lombok.Data;

@Data
public class RecruiterDTO {
    private Integer userId;
    private String companyName;
    private String bio;
    private String companyWebsite;
    private Integer locationId;
    private String position;
    private String logoUrl;
}
