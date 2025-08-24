package com.dtt.controller;

import com.dtt.dto.ChangePasswordDTO;
import com.dtt.dto.LoginDTO;
import com.dtt.dto.PublicUserDTO;
import com.dtt.dto.UserDTO;
import com.dtt.model.Applicant;
import com.dtt.model.Recruiter;
import com.dtt.model.User;
import com.dtt.service.ApplicantService;
import com.dtt.service.RecruiterService;
import com.dtt.service.UserService;
import com.dtt.utils.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api")
public class ApiUserController {
    @Autowired
    private UserService userService;

    @Autowired
    private ApplicantService applicantService;

    @Autowired
    private RecruiterService recruiterService;

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUser(){
        return ResponseEntity.ok(this.userService.getAllUser());
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<User> getUserById(@PathVariable int id){
        return ResponseEntity.ok(this.userService.getUserById(id));
    }

    @GetMapping("/public/users/{id}")
    public ResponseEntity<PublicUserDTO> getPublicUserById(@PathVariable int id){
        PublicUserDTO publicUserDTO = new PublicUserDTO();
        User user = this.userService.getUserById(id);
        publicUserDTO.setUserId(id);
        publicUserDTO.setEmail(user.getEmail());
        publicUserDTO.setFirstName(user.getFirstName());
        publicUserDTO.setLastName(user.getLastName());
        publicUserDTO.setEmail(user.getEmail());

        return ResponseEntity.ok(publicUserDTO);
    }

    @PostMapping("/users/add")
    public ResponseEntity<?> addUser(@ModelAttribute UserDTO userDTO){
        User user = new User();
        user.setUsername(userDTO.getUsername());
        user.setPassword(userDTO.getPassword());
        user.setEmail(userDTO.getEmail());
        user.setFirstName(userDTO.getFirstName());
        user.setLastName(userDTO.getLastName());
        user.setPhone(userDTO.getPhone());
        user.setRole(User.Role.valueOf(userDTO.getRole()));
        user.setProvider(User.Provider.valueOf(userDTO.getProvider()));
        user.setProviderId(userDTO.getProviderId());
        user.setCreatedAt(LocalDateTime.now());
        user.setFile(userDTO.getFile());

        return ResponseEntity.ok(this.userService.addOrUpdateUser(user));
    }

    @PatchMapping("/users/{id}/update")
    public ResponseEntity<User> updateUser(@ModelAttribute UserDTO userDTO, @PathVariable int id){
        User user = this.userService.getUserById(id);
        user.setEmail(userDTO.getEmail());
        user.setFirstName(userDTO.getFirstName());
        user.setLastName(userDTO.getLastName());
        user.setPhone(userDTO.getPhone());
        user.setRole(User.Role.valueOf(userDTO.getRole()));
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

    @PostMapping("/register/applicant")
    public ResponseEntity<Applicant> registerApplicant(@ModelAttribute UserDTO userDTO){
        User user = new User();
        user.setUsername(userDTO.getUsername());
        user.setPassword(userDTO.getPassword());
        user.setEmail(userDTO.getEmail());
        user.setFirstName(userDTO.getFirstName());
        user.setLastName(userDTO.getLastName());
        user.setPhone(userDTO.getPhone());
        user.setRole(User.Role.APPLICANT);
        user.setProvider(User.Provider.LOCAL);
        user.setProviderId(null);
        user.setFile(userDTO.getFile());
        user.setCreatedAt(LocalDateTime.now());

        this.userService.addOrUpdateUser(user);
        Applicant applicant = new Applicant();
        applicant.setUser(user);

        return ResponseEntity.ok(this.applicantService.addApplicant(applicant));
    }

    @PostMapping("register/recruiter")
    public ResponseEntity<Recruiter> registerRecruiter(@ModelAttribute UserDTO userDTO){
        User user = new User();
        user.setUsername(userDTO.getUsername());
        user.setPassword(userDTO.getPassword());
        user.setEmail(userDTO.getEmail());
        user.setFirstName(userDTO.getFirstName());
        user.setLastName(userDTO.getLastName());
        user.setPhone(userDTO.getPhone());
        user.setRole(User.Role.RECRUITER);
        user.setProvider(User.Provider.LOCAL);
        user.setProviderId(null);
        user.setFile(userDTO.getFile());
        user.setCreatedAt(LocalDateTime.now());

        this.userService.addOrUpdateUser(user);
        Recruiter recruiter = new Recruiter();
        recruiter.setUser(user);

        return ResponseEntity.ok(this.recruiterService.addRecruiter(recruiter));
    }


    @RequestMapping("/secure/profile")
    @ResponseBody
    @CrossOrigin
    public ResponseEntity<User> getProfile(Principal principal) {
        return new ResponseEntity<>(this.userService.getUserByUsername(principal.getName()), HttpStatus.OK);
    }

    @PatchMapping("/secure/profile/update")
    @ResponseBody
    @CrossOrigin
    public ResponseEntity<User> updateProfile(Principal principal, @ModelAttribute UserDTO userDTO) {
        User user = this.userService.getUserByUsername(principal.getName());
        user.setEmail(userDTO.getEmail());
        user.setFirstName(userDTO.getFirstName());
        user.setLastName(userDTO.getLastName());
        user.setPhone(userDTO.getPhone());
        user.setFile(userDTO.getFile());


        return ResponseEntity.ok(this.userService.addOrUpdateUser(user));
    }

    @PatchMapping("/secure/profile/change-password")
    @ResponseBody
    @CrossOrigin
    public ResponseEntity<?> changePassword(Principal principal, @RequestBody ChangePasswordDTO changePasswordDTO){
        User user = this.userService.getUserByUsername(principal.getName());
        if (this.userService.authenticate(user.getUsername(), changePasswordDTO.getCurrentPassword())) {
            user.setPassword(changePasswordDTO.getNewPassword());

            return ResponseEntity.ok(this.userService.changePasswordUser(user));
        }

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body("Mật khẩu cũ không khớp");
    }
}
