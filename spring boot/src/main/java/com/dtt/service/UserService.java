package com.dtt.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.dtt.model.User;
import com.dtt.repository.UserRepository;
import com.dtt.security.CustomUserDetails;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.*;
import java.util.logging.Level;
import java.util.logging.Logger;

@Service
public class UserService implements UserDetailsService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private Cloudinary cloudinary;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User u = this.getUserByUsername(username);
        if (u == null) {
            throw new UsernameNotFoundException("Invalid username");
        }

        Set<GrantedAuthority> authorities = new HashSet<>();
        authorities.add(new SimpleGrantedAuthority("ROLE_" + u.getRole().name()));

        return new CustomUserDetails(u.getUserId(), u.getUsername(), u.getPassword(), authorities);
    }

    public List<User> getAllUser(){
        return this.userRepository.findAll();
    }

    public User getUserById(int id){
        Optional<User> user = this.userRepository.findById(id);

        return user.orElse(null);
    }

    public User getUserByUsername(String username){
        Optional<User> user = this.userRepository.findByUsername(username);

        return user.orElse(null);
    }

    @Transactional
    public User addOrUpdateUser(User u){
        if (u.getFile() != null && !u.getFile().isEmpty()) {
            try {
                Map res = cloudinary.uploader().upload(u.getFile().getBytes(), ObjectUtils.asMap("resource_type", "auto"));
                u.setAvatar(res.get("secure_url").toString());
            } catch (IOException ex) {
                Logger.getLogger(UserService.class.getName()).log(Level.SEVERE, null, ex);
            }
        }

        if (u.getPassword() != null && !u.getPassword().isEmpty()) {
            u.setPassword(this.passwordEncoder.encode(u.getPassword()));
        }

        return this.userRepository.save(u);
    }

    @Transactional
    public void deleteUser(User user){
        this.userRepository.delete(user);
    }

    public boolean authenticate(String username, String password) {
        Optional<User> u = this.userRepository.findByUsername(username);
        if (u.isPresent()) {
            User user = u.get();
            return passwordEncoder.matches(password, user.getPassword());
        }

        return false;
    }

}
