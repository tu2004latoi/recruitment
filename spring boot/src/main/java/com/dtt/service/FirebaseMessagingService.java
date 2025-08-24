package com.dtt.service;

import com.google.firebase.messaging.*;
import org.springframework.stereotype.Service;

@Service
public class FirebaseMessagingService {

    public String sendNotification(String title, String body, String fcmToken) throws FirebaseMessagingException {
        Notification notification = Notification.builder()
                .setTitle(title)
                .setBody(body)
                .build();

        WebpushConfig webpushConfig = WebpushConfig.builder()
                .setNotification(new WebpushNotification(title, body))
                .build();

        Message message = Message.builder()
                .setToken(fcmToken)
                .setNotification(notification)
                .setWebpushConfig(webpushConfig)
                .build();

        String response = FirebaseMessaging.getInstance().send(message);
        return "Đã gửi thành công với ID: " + response;
    }
}