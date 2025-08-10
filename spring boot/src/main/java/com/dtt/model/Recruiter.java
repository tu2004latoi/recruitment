package com.dtt.model;

import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;

@Entity
@Table(name = "recruiters")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Recruiter implements Serializable {

    @Id
    @Column(name = "recruiter_id")
    private Integer recruiterId;

    @OneToOne
    @MapsId
    @JoinColumn(name = "recruiter_id", referencedColumnName = "user_id")
    private User user;

    @Column(name = "company_name", length = 250, nullable = false)
    private String companyName;

    @Column(columnDefinition = "text")
    private String bio;

    @Column(name = "company_website", length = 255)
    private String companyWebsite;

    @ManyToOne
    @JoinColumn(name = "location_id", referencedColumnName = "location_id")
    private Location location;

    @Column(length = 100)
    private String position;

    @Column(name = "logo_url", length = 500)
    private String logoUrl;
}
