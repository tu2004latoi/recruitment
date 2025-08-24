package com.dtt.dto;

import lombok.Data;

@Data
public class MessageRequestDTO {
    private int senderId;
    private int receiverId;
    private String content;
}
