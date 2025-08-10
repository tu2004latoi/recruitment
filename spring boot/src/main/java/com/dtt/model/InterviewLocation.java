package com.dtt.model;

import jakarta.persistence.*;
import lombok.Data;
import java.io.Serializable;

@Data
@Entity
@Table(name = "interview_locations")
public class InterviewLocation implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "interview_location_id")
    private Integer interviewLocationId;

    @Column(length = 50, nullable = false)
    private String province;   // Tỉnh/Thành phố

    @Column(length = 50, nullable = false)
    private String district;   // Quận/Huyện

    @Column(length = 100)
    private String address;    // Địa chỉ cụ thể

    @Column(columnDefinition = "TEXT")
    private String notes;      // Ghi chú thêm (VD: hướng dẫn, chỉ đường)
}
