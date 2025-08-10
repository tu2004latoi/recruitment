package com.dtt.model;

import jakarta.persistence.*;
import lombok.Data;

import java.io.Serializable;

@Data
@Entity
@Table(name = "locations")
public class Location implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "location_id")
    private Integer locationId;

    @Column(nullable = false, length = 50)
    private String province;

    @Column(nullable = false, length = 50)
    private String district;

    @Column(length = 100)
    private String address;

    @Lob
    private String notes;

    @Transient
    public String getGoogleMapsUrl() {
        String fullAddress = String.format("%s, %s, %s",
                this.address != null ? this.address : "",
                this.district,
                this.province
        );
        return "https://www.google.com/maps?q=" + fullAddress.replace(" ", "+");
    }

}
