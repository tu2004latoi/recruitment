package com.dtt.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "recruiters")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Recruiter {

    @Id
    @Column(name = "recruiter_id")
    private Integer recruiterId;

    @OneToOne
    @MapsId
    @JoinColumn(name = "recruiter_id", referencedColumnName = "user_id")
    private User user;

    @Column(name = "company_name", length = 250)
    private String companyName;

    @Column(columnDefinition = "text")
    private String bio;
}