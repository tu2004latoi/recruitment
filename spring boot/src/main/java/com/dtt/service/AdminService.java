package com.dtt.service;

import com.dtt.model.Admin;
import com.dtt.model.User;
import com.dtt.repository.AdminRepository;
import com.dtt.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AdminService {
    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private UserService userService;

    public List<Admin> getAllAdmin(){
        return this.adminRepository.findAll();
    }

    public Admin getAdminById(int id){
        Optional<Admin> admin = this.adminRepository.findById(id);
        return admin.orElse(null);
    }

    @Transactional
    public Admin addAdmin(Admin admin){
        if (admin.getAdminId() != null){
            throw new IllegalArgumentException("New Admin must not have an ID");
        }

        return this.adminRepository.save(admin);
    }

    @Transactional
    public Admin updateAdmin(Admin admin){
        if (admin.getAdminId() == null || !adminRepository.existsById(admin.getAdminId())) {
            throw new EntityNotFoundException("Admin not found with ID: " + admin.getAdminId());
        }

        return adminRepository.save(admin);
    }

    @Transactional
    public void deleteAdmin(Admin admin){
        if (admin == null){
            throw new IllegalArgumentException("Admin not found");
        }

        this.adminRepository.delete(admin);
    }
}
