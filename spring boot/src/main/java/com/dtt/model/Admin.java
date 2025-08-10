package com.dtt.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Entity
@Table(name = "admins")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Admin implements Serializable {

    @Id
    @Column(name = "admin_id")
    private Integer adminId;

    @OneToOne
    @MapsId
    @JoinColumn(name = "admin_id", referencedColumnName = "user_id")
    private User user;
}
