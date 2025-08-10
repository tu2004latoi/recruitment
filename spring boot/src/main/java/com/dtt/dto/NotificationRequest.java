package com.dtt.dto;

import lombok.Data;

@Data
public class NotificationRequest {
    private String title;
    private String body;
    private String fcmToken;
}