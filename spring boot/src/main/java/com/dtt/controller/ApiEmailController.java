package com.dtt.controller;

import com.dtt.dto.ApplicationAcceptedEmailDTO;
import com.dtt.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class ApiEmailController {
    @Autowired
    private EmailService emailService;

    @PostMapping("/send/email/accepted")
    public ResponseEntity<?> sendMail(@RequestBody ApplicationAcceptedEmailDTO applicationAcceptedEmailDTO){
        try {
            emailService.sendApplicationAcceptedEmail(applicationAcceptedEmailDTO);
            return ResponseEntity.ok("Email sent successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to send email: " + e.getMessage());
        }
    }

}
