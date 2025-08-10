package com.dtt.dto;

import com.dtt.model.Applicant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplicantDTO {
    private Integer userId;
    private String fullName;
    private Date dob;
    private Applicant.Gender gender;
    private Integer locationId;
    private Integer experienceYears;
    private String skills;
    private String jobTitle;
    private String bio;
}
