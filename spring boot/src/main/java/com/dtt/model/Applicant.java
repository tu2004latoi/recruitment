package com.dtt.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.Date;
import java.util.List;

@Entity
@Table(name = "applicants")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Applicant implements Serializable {

    @Id
    @Column(name = "applicant_id")
    private Integer applicantId;

    @OneToOne(cascade = CascadeType.ALL)
    @MapsId
    @JoinColumn(name = "applicant_id", referencedColumnName = "user_id")
    private User user;

    @Temporal(TemporalType.DATE)
    private Date dob;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "enum('MALE','FEMALE')")
    private Gender gender;

    @OneToOne
    @JoinColumn(name = "location_id", referencedColumnName = "location_id")
    private Location location;

    @Column(name = "experience_years")
    private Integer experienceYears;

    @Column(columnDefinition = "text")
    private String skills;

    @Column(name = "job_title")
    private String jobTitle;

    @Column(columnDefinition = "text")
    private String bio;

    public enum Gender {
        MALE, FEMALE
    }

    public String fullName(){
        return user.getLastName() + user.getFirstName();
    }
}
