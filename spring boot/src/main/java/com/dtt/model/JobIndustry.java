package com.dtt.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "job_industries")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobIndustry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "industry_id")
    private Integer industryId;

    @Column(name = "name", length = 100, nullable = false)
    private String name;
}