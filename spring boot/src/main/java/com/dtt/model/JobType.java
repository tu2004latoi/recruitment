package com.dtt.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "job_types")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class JobType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "job_type_id")
    private Integer jobTypeId;

    @Column(name = "name", length = 50, nullable = false)
    private String name;
}