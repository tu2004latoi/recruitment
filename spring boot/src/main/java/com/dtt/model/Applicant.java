package com.dtt.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Entity
@Table(name = "applicants")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Applicant {

    @Id
    @Column(name = "applicant_id")
    private Integer applicantId;

    @OneToOne
    @MapsId
    @JoinColumn(name = "applicant_id", referencedColumnName = "user_id")
    private User user;

    @Temporal(TemporalType.DATE)
    private Date dob;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "enum('MALE','FEMALE')")
    private Gender gender;

    private String address;

    @Column(name = "experience_years")
    private Integer experienceYears;

    @Column(columnDefinition = "text")
    private String skills;

    @Column(columnDefinition = "text")
    private String bio;

    @ManyToOne
    @JoinColumn(name = "education_id", foreignKey = @ForeignKey(name = "FK_education"), nullable = true)
    private Education education;

    public enum Gender {
        MALE, FEMALE
    }
}
