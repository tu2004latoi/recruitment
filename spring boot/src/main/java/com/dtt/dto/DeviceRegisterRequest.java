package com.dtt.dto;

import com.dtt.model.UserDevice;
import lombok.Data;

@Data
public class DeviceRegisterRequest {
    private int userId;
    private String fcmToken;
    private UserDevice.DeviceType deviceType;
}
