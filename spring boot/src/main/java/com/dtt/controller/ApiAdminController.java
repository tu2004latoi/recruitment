package com.dtt.controller;

import com.dtt.model.Admin;
import com.dtt.service.AdminService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ApiAdminController {
    @Autowired
    private AdminService adminService;

    @GetMapping("/admins")
    public ResponseEntity<List<Admin>> getAllAdmin(){
        return ResponseEntity.ok(this.adminService.getAllAdmin());
    }

    @GetMapping("/admins/{id}")
    public ResponseEntity<Admin> getAdminById(@PathVariable int id){
        return ResponseEntity.ok(this.adminService.getAdminById(id));
    }

    @PostMapping("/admins/add")
    public ResponseEntity<Admin> addAdmin(@RequestBody Admin admin) {
        return ResponseEntity.ok(this.adminService.addAdmin(admin));
    }

    @DeleteMapping("/admins/{id}/delete")
    public ResponseEntity<String> deleteAdmin(@PathVariable int id){
        Admin admin = this.adminService.getAdminById(id);
        this.adminService.deleteAdmin(admin);

        return ResponseEntity.ok("ok");
    }
}
