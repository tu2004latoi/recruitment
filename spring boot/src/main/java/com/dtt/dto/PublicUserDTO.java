package com.dtt.dto;

import lombok.Data;

@Data
public class PublicUserDTO {
    private Integer userId;
    private String firstName;
    private String lastName;
    private String email;
}
