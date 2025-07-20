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
    private User.Role role;
    private MultipartFile file;
}
