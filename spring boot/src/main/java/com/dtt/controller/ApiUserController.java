package com.dtt.controller;

import com.dtt.dto.LoginDTO;
import com.dtt.dto.UserDTO;
import com.dtt.model.User;
import com.dtt.service.UserService;
import com.dtt.utils.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api")
public class ApiUserController {
    @Autowired
    private UserService userService;

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUser(){
        return ResponseEntity.ok(this.userService.getAllUser());
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<User> getUserById(@PathVariable int id){
        return ResponseEntity.ok(this.userService.getUserById(id));
    }

    @PostMapping("/users/add")
    public ResponseEntity<User> addUser(@ModelAttribute UserDTO userDTO){
        User user = new User();
        user.setUsername(userDTO.getUsername());
        user.setPassword(userDTO.getPassword());
        user.setEmail(userDTO.getEmail());
        user.setFirstName(userDTO.getFirstName());
        user.setLastName(userDTO.getLastName());
        user.setPhone(userDTO.getPhone());
        user.setRole(userDTO.getRole());
        user.setFile(userDTO.getFile());
        user.setCreatedAt(LocalDateTime.now());


        return ResponseEntity.ok(this.userService.addOrUpdateUser(user));
    }

    @PatchMapping("/users/{id}/update")
    public ResponseEntity<User> updateUser(@ModelAttribute UserDTO userDTO, @PathVariable int id){
        User user = this.userService.getUserById(id);
        user.setPassword(userDTO.getPassword());
        user.setEmail(userDTO.getEmail());
        user.setFirstName(userDTO.getFirstName());
        user.setLastName(userDTO.getLastName());
        user.setPhone(userDTO.getPhone());
        user.setRole(userDTO.getRole());
        user.setFile(userDTO.getFile());

        return ResponseEntity.ok(this.userService.addOrUpdateUser(user));
    }

    @DeleteMapping("/users/{id}/delete")
    public ResponseEntity<String> deleteUser(@PathVariable int id){
        User user = this.userService.getUserById(id);
        this.userService.deleteUser(user);

        return ResponseEntity.ok("ok");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginDTO u) {
        if (u.getUsername() == null || u.getPassword() == null) {
            return ResponseEntity.badRequest().body("Username hoặc password không được để trống");
        }

        if (this.userService.authenticate(u.getUsername(), u.getPassword())) {
            try {
                String token = JwtUtils.generateToken(u.getUsername());
                return ResponseEntity.ok().body(Collections.singletonMap("token", token));
            } catch (Exception e) {
                return ResponseEntity.status(500).body("Lỗi khi tạo JWT");
            }
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Sai thông tin đăng nhập");
    }


    @RequestMapping("/secure/profile")
    @ResponseBody
    @CrossOrigin
    public ResponseEntity<User> getProfile(Principal principal) {
        return new ResponseEntity<>(this.userService.getUserByUsername(principal.getName()), HttpStatus.OK);
    }
}
