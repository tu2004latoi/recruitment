package com.dtt.controller;

import com.dtt.dto.ApplicantDTO;
import com.dtt.dto.EducationDTO;
import com.dtt.dto.LocationDTO;
import com.dtt.dto.UserDTO;
import com.dtt.model.User;
import com.dtt.model.Applicant;
import com.dtt.model.Location;
import com.dtt.model.Education;
import com.dtt.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class ApiExportController {

    @Autowired
    private UserService userService;

    @Autowired
    private ApplicantService applicantService;

    @Autowired
    private LocationService locationService;

    @Autowired
    private EducationService educationService;

    @Autowired
    private CVPdfExportUniqueService999 cvPdfExportUniqueService999;

    @GetMapping("/export/{userId}")
    public ResponseEntity<byte[]> exportCV(@PathVariable Integer userId) throws Exception {
        // Lấy dữ liệu entity
        User user = userService.getUserById(userId);
        Applicant applicant = applicantService.getApplicantByUser(user);
        Location location = locationService.getLocationById(applicant.getLocation().getLocationId());
        List<Education> educations = educationService.getEducationByUser(user);

        // Convert sang DTO
        UserDTO userDTO = new UserDTO();
        userDTO.setUsername(user.getUsername());
        userDTO.setEmail(user.getEmail());
        userDTO.setFirstName(user.getFirstName());
        userDTO.setLastName(user.getLastName());
        userDTO.setPhone(user.getPhone());
        userDTO.setAvatar(user.getAvatar());
        // file bỏ qua vì không dùng ở đây

        ApplicantDTO applicantDTO = ApplicantDTO.builder()
                .userId(user.getUserId())
                .fullName(applicant.fullName())
                .dob(applicant.getDob())
                .gender(applicant.getGender())
                .locationId(location.getLocationId())
                .experienceYears(applicant.getExperienceYears())
                .skills(applicant.getSkills())
                .jobTitle(applicant.getJobTitle())
                .bio(applicant.getBio())
                .build();

        LocationDTO locationDTO = new LocationDTO();
        locationDTO.setLocationId(location.getLocationId());
        locationDTO.setProvince(location.getProvince());
        locationDTO.setDistrict(location.getDistrict());
        locationDTO.setAddress(location.getAddress());
        locationDTO.setNotes(location.getNotes());

        List<EducationDTO> educationDTOs = educations.stream().map(e -> {
            EducationDTO dto = new EducationDTO();
            dto.setTitle(e.getTitle());
            dto.setYear(e.getYear());
            dto.setInstitutionId(e.getInstitution().getInstitutionId());
            dto.setLevelId(e.getLevel().getLevelId());
            dto.setUserId(user.getUserId());
            return dto;
        }).collect(Collectors.toList());

        // Tạo PDF từ DTO
        byte[] pdfBytes = cvPdfExportUniqueService999.generateCV(userDTO, applicantDTO, locationDTO, educationDTOs);

        // Trả file PDF
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "cv.pdf");

        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    }
}
