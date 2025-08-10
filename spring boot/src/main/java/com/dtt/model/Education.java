package com.dtt.model;

import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;

@Entity
@Table(name = "educations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Education implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "education_id")
    private Integer educationId;

    @Column(name = "title", nullable = false, length = 100)
    private String title;

    @Column(name = "year")
    private Integer year;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "institution_id", nullable = false)
    private Institution institution;

    @ManyToOne
    @JoinColumn(name = "level_id")
    private Level level;
}
