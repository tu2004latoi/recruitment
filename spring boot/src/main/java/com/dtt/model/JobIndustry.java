package com.dtt.model;

import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;

@Entity
@Table(name = "job_industries")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobIndustry implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "industry_id")
    private Integer industryId;

    @Column(name = "name", length = 100, nullable = false)
    private String name;
}