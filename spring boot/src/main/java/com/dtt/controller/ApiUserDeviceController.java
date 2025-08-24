package com.dtt.controller;

import com.dtt.dto.DeviceRegisterRequest;
import com.dtt.model.User;
import com.dtt.model.UserDevice;
import com.dtt.service.UserDeviceService;
import com.dtt.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ApiUserDeviceController {
    @Autowired
    private UserDeviceService userDeviceService;

    @Autowired
    private UserService userService;

    @PostMapping("/devices/register")
    public ResponseEntity<UserDevice> registerDevice(@RequestBody DeviceRegisterRequest request) {
        UserDevice device = userDeviceService.registerDevice(
                request.getUserId(),
                request.getFcmToken(),
                request.getDeviceType()
        );
        return ResponseEntity.ok(device);
    }

    @GetMapping("/devices/{userId}")
    public ResponseEntity<List<UserDevice>> getDevices(@PathVariable int userId) {
        User user = this.userService.getUserById(userId);
        return ResponseEntity.ok(userDeviceService.getDevicesByUser(user));
    }

    @DeleteMapping("/devices/{fcmToken}")
    public ResponseEntity<Void> removeDevice(@PathVariable String fcmToken) {
        userDeviceService.removeDevice(fcmToken);
        return ResponseEntity.noContent().build();
    }
}
