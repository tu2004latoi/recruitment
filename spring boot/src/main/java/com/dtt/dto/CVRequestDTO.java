package com.dtt.dto;

import lombok.Data;
import java.util.List;

@Data
public class CVRequestDTO {
    private UserDTO user;
    private ApplicantDTO applicant;
    private LocationDTO location;
    private List<EducationDTO> educations;
}
