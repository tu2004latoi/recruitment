package com.dtt.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Cascade;

import java.io.Serializable;
import java.time.LocalDateTime;

@Entity
@Table(name = "interviews")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Interview implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "interview_id")
    private Integer interviewId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = false)
    private Job job;

    @Column(name = "scheduled_at")
    private LocalDateTime scheduledAt;

    @ManyToOne
    @JoinColumn(name = "location_id", foreignKey = @ForeignKey(name = "fk_interviews_location"))
    private Location location;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20)
    private Status status;

    public enum Status {
        SCHEDULED,
        DONE,
        CANCELLED
    }
}