package com.dtt.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;
import java.io.InputStream;

@Configuration
public class FirebaseConfig {

    @PostConstruct
    public void init() {
        try {
            InputStream serviceAccount = getClass()
                    .getClassLoader()
                    .getResourceAsStream("firebase/firebase-service-account.json");

            if (serviceAccount == null) {
                throw new IllegalStateException("Không tìm thấy firebase-service-account.json trong thư mục resources/firebase/");
            }

            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .setStorageBucket("your-project-id.appspot.com") // Thêm nếu dùng Cloud Storage
                    .build();

            if (FirebaseApp.getApps().isEmpty()) {
                FirebaseApp.initializeApp(options);
                System.out.println("✅ Firebase đã được khởi tạo thành công.");
            }

        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
