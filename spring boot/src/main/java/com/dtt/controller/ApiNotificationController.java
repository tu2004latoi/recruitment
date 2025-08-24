package com.dtt.controller;

import com.dtt.dto.NotificationBatchRequest;
import com.dtt.dto.NotificationRequest;
import com.dtt.model.User;
import com.dtt.model.UserDevice;
import com.dtt.service.FirebaseMessagingService;
import com.dtt.service.UserDeviceService;
import com.dtt.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ApiNotificationController {

    private final FirebaseMessagingService messagingService;
    @Autowired
    private UserDeviceService userDeviceService;

    @Autowired
    private UserService userService;

    public ApiNotificationController(FirebaseMessagingService messagingService) {
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

    @PostMapping("/notifications/send-user")
    public ResponseEntity<String> sendUserNotification(@RequestBody NotificationBatchRequest req) {
        try {
            User user = this.userService.getUserById(req.getUserId());
            List<UserDevice> devices = userDeviceService.getDevicesByUser(user);
            System.out.print("Devices: " + devices);

            if (devices.isEmpty()) {
                return ResponseEntity.badRequest().body("User has no devices registered");
            }

            for (UserDevice device : devices) {
                messagingService.sendNotification(req.getTitle(), req.getBody(), device.getFcmToken());
            }

            return ResponseEntity.ok("Notification sent to " + devices.size() + " devices");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi: " + e.getMessage());
        }
    }
}