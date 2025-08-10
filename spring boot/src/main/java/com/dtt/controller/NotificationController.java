package com.dtt.controller;

import com.dtt.dto.NotificationRequest;
import com.dtt.service.FirebaseMessagingService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class NotificationController {

    private final FirebaseMessagingService messagingService;

    public NotificationController(FirebaseMessagingService messagingService) {
        this.messagingService = messagingService;
    }

    @PostMapping("/notifications/send")
    public ResponseEntity<String> sendNotification(@RequestBody NotificationRequest req) {
        try {
            String result = messagingService.sendNotification(req.getTitle(), req.getBody(), req.getFcmToken());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi: " + e.getMessage());
        }
    }
}