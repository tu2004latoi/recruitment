package com.dtt.model;

import com.dtt.model.JobIndustry;
import com.dtt.model.JobType;
import com.dtt.model.Level;
import com.dtt.model.Recruiter;
import jakarta.persistence.*;
import lombok.Data;

import java.io.Serializable;
import java.util.Date;

@Data
@Entity
@Table(name = "jobs")
public class Job implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer jobId;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id", nullable = false, foreignKey = @ForeignKey(name = "fk_jobs_recruiter"))
    private User user;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne
    @JoinColumn(name = "location_id", referencedColumnName = "location_id")
    private Location location;

    @ManyToOne
    @JoinColumn(name = "level_id", foreignKey = @ForeignKey(name = "fk_jobs_level"))
    private Level level;

    @Column(name = "salary")
    private Integer salary;

    @Column(name = "views_count", nullable = false)
    private Integer viewsCount = 0;

    @Column(name = "application_count", nullable = false)
    private Integer applicationCount = 0;

    @Column(nullable = false)
    private Integer quantity = 1;

    @ManyToOne
    @JoinColumn(name = "job_type_id", foreignKey = @ForeignKey(name = "fk_jobs_job_type"))
    private JobType jobType;

    @ManyToOne
    @JoinColumn(name = "industry_id", foreignKey = @ForeignKey(name = "fk_jobs_industry"))
    private JobIndustry industry;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "created_at", updatable = false)
    @org.hibernate.annotations.CreationTimestamp
    private Date createdAt;

    @Temporal(TemporalType.TIMESTAMP)
    @org.hibernate.annotations.UpdateTimestamp
    @Column(name = "updated_at")
    private Date updatedAt;

    @Temporal(TemporalType.TIMESTAMP)
    private Date expiredAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private Status status;

    @Column(name = "is_featured")
    private Boolean isFeatured = false;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @ManyToOne
    @JoinColumn(name = "moderator_id", foreignKey = @ForeignKey(name = "fk_jobs_approved_by"))
    private User moderator;

    public enum Status{
        PENDING,
        APPROVED,
        REJECTED
    }
}
