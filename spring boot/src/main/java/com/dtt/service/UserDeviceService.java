package com.dtt.service;

import com.dtt.model.User;
import com.dtt.model.UserDevice;
import com.dtt.repository.UserDeviceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserDeviceService {
    @Autowired
    private UserDeviceRepository userDeviceRepository;

    @Autowired
    private UserService userService;

    public UserDevice registerDevice(int userId, String fcmToken, UserDevice.DeviceType deviceType) {
        User user = this.userService.getUserById(userId);

        // Kiểm tra user + token đã tồn tại chưa
        Optional<UserDevice> existing = userDeviceRepository.findByUserAndFcmToken(user, fcmToken);
        if (existing.isPresent()) {
            return existing.get(); // đã có, không tạo mới
        }

        // Tạo bản ghi mới cho user + token
        UserDevice device = UserDevice.builder()
                .user(user)
                .fcmToken(fcmToken)
                .deviceType(deviceType)
                .build();

        return userDeviceRepository.save(device);
    }


    public List<UserDevice> getDevicesByUser(User user) {
        return userDeviceRepository.findByUser(user);
    }

    public void removeDevice(String fcmToken) {
        userDeviceRepository.deleteByFcmToken(fcmToken);
    }
}
