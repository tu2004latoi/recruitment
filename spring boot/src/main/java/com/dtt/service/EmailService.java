package com.dtt.service;

import com.dtt.dto.ApplicationAcceptedEmailDTO;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    @Autowired
    private JavaMailSender mailSender;

    public void sendApplicationAcceptedEmail(ApplicationAcceptedEmailDTO emailDTO) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, "utf-8");

            String subject = "Thông báo kết quả ứng tuyển";
            String content = String.format(
                    "Chào %s,\n\n" +
                            "Chúc mừng bạn đã vượt qua vòng xét duyệt hồ sơ cho vị trí \"%s\".\n" +
                            "Chúng tôi sẽ liên hệ với bạn sớm để sắp xếp lịch phỏng vấn phù hợp.\n\n" +
                            "Trân trọng,\nĐội ngũ tuyển dụng",
                    emailDTO.getApplicantName(), emailDTO.getTitle()
            );

            helper.setTo(emailDTO.getTo());
            helper.setSubject(subject);
            helper.setText(content, false); // false = text thuần (plain text)

            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Gửi email thất bại: " + e.getMessage(), e);
        }
    }
}

