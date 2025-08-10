package com.dtt.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import java.io.Serializable;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "applications", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"applicant_id", "job_id"})
})
public class Application implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "application_id")
    private Integer applicationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = false)
    private Job job;

    @Column(name = "cv", length = 500)
    private String cv;

    @Column(name = "cover_letter")
    private String coverLetter;

    @Column(name = "applied_at", columnDefinition = "DATETIME DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime appliedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ApplicationStatus status = ApplicationStatus.PENDING;

    @Column(name = "interview_schedule_sent")
    private Boolean interviewScheduleSent = false;

    @Transient
    @JsonIgnore
    private MultipartFile file;

    // Constructors
    public Application() {
        this.appliedAt = LocalDateTime.now();
    }

    public enum ApplicationStatus {
        PENDING,
        ACCEPTED,
        REJECTED
    }

}
