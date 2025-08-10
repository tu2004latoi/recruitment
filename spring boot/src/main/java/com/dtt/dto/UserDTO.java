package com.dtt.dto;

import com.dtt.model.User;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class UserDTO {
    private String username;
    private String password;
    private String email;
    private String firstName;
    private String lastName;
    private String phone;
    private String role;
    private String provider;
    private String providerId;
    private String avatar;
    private MultipartFile file;
}
