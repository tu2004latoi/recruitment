package com.dtt.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ChatPartnerDTO {
    private int id;
    private String username;
    private String firstName;
    private String lastName;
    private String avatar;
}
