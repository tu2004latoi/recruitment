package com.dtt.controller;

import com.dtt.model.Admin;
import com.dtt.model.User;
import com.dtt.service.AdminService;
import com.dtt.service.UserService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ApiAdminController {
    @Autowired
    private AdminService adminService;

    @Autowired
    private UserService userService;

    @GetMapping("/users/admins")
    public ResponseEntity<List<Admin>> getAllAdmin(){
        return ResponseEntity.ok(this.adminService.getAllAdmin());
    }

    @GetMapping("/users/admins/{id}")
    public ResponseEntity<Admin> getAdminById(@PathVariable int id){
        return ResponseEntity.ok(this.adminService.getAdminById(id));
    }

    @PostMapping("/users/admins/add")
    public ResponseEntity<Admin> addAdmin(@RequestBody Map<String, Integer> body) {
        int userId = body.get("userId");
        User user = this.userService.getUserById(userId);
        Admin admin = new Admin();
        admin.setUser(user);
        return ResponseEntity.ok(this.adminService.addAdmin(admin));
    }

    @PatchMapping("/users/admins/{id}/update")
    public ResponseEntity<Admin> updateAdmin(@PathVariable int id, @RequestBody Map<String, Integer> body){
        Admin admin = this.adminService.getAdminById(id);
        int userId = body.get("userId");
        User user = this.userService.getUserById(userId);
        admin.setUser(user);
        return ResponseEntity.ok(this.adminService.updateAdmin(admin));
    }

    @DeleteMapping("/users/admins/{id}/delete")
    public ResponseEntity<String> deleteAdmin(@PathVariable int id){
        Admin admin = this.adminService.getAdminById(id);
        this.adminService.deleteAdmin(admin);

        return ResponseEntity.ok("ok");
    }
}
