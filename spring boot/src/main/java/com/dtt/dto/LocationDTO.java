package com.dtt.dto;

import lombok.Data;

@Data
public class LocationDTO {
    private int locationId;
    private String province;
    private String district;
    private String address;
    private String notes;
}
