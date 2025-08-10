package com.dtt.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.Serializable;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Integer userId;

    @Column(name = "username", nullable = false, unique = true, length = 255)
    private String username;

    @JsonIgnore
    @Column(name = "password", nullable = false, length = 255)
    private String password;

    @Column(name = "email", nullable = false, unique = true, length = 255)
    private String email;

    @Column(name = "first_name", length = 50)
    private String firstName;

    @Column(name = "last_name", length = 50)
    private String lastName;

    @Column(name = "phone", length = 10)
    private String phone;

    @Column(name = "avatar", length = 500)
    private String avatar;

    @Enumerated(EnumType.STRING)
    @Column(name = "provider", length = 20)
    private Provider provider;

    @Column(name = "provider_id", length = 255)
    private String providerId;


    @Enumerated(EnumType.STRING)
    @Column(name = "role", length = 20)
    private Role role;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Transient
    @JsonIgnore
    private MultipartFile file;

    public enum Role {
        ADMIN,
        RECRUITER,
        APPLICANT,
        MODERATOR
    }

    public enum Provider {
        LOCAL,
        GOOGLE
    }
}
