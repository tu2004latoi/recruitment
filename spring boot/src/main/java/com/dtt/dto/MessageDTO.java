package com.dtt.dto;

import com.dtt.model.Message;
import com.dtt.model.User;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class MessageDTO {
    private int messageId;
    private int senderId;
    private String senderName;
    private int receiverId;
    private String receiverName;
    private String content;
    private LocalDateTime createdAt;
    private String status;

    // Entity -> DTO
    public static MessageDTO fromEntity(Message message) {
        MessageDTO dto = new MessageDTO();
        dto.setMessageId(message.getMessageId());
        dto.setSenderId(message.getSender().getUserId());
        dto.setSenderName(message.getSender().getName()); // hoặc getUsername()
        dto.setReceiverId(message.getReceiver().getUserId());
        dto.setReceiverName(message.getReceiver().getName());
        dto.setContent(message.getContent());
        dto.setCreatedAt(message.getCreatedAt());
        dto.setStatus(message.getStatus().name()); // Enum -> String
        return dto;
    }

    // DTO -> Entity (khi tạo mới message)
    public Message toEntity(User sender, User receiver) {
        Message message = new Message();
        message.setSender(sender);
        message.setReceiver(receiver);
        message.setContent(this.getContent());
        message.setCreatedAt(LocalDateTime.now());
        message.setStatus(Message.Status.SENT);
        return message;
    }
}


