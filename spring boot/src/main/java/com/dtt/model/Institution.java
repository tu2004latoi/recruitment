package com.dtt.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "institutions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Institution {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "institution_id")
    private Integer institutionId;

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "country", nullable = false, length = 100)
    private String country;

    @Column(name = "domain", nullable = false, length = 100)
    private String domain;

    @Column(name = "website", nullable = false, length = 255)
    private String website;
}
