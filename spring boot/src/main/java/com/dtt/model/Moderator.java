package com.dtt.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.io.Serializable;
import java.time.LocalDateTime;

@Entity
@Table(name = "moderators")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Moderator implements Serializable {

    @Id
    @Column(name = "moderator_id")
    private Integer moderatorId;

    @OneToOne
    @MapsId
    @JoinColumn(name = "moderator_id")
    private User user;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}

