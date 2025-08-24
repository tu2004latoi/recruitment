package com.dtt.dto;

import lombok.Data;

@Data
public class NotificationBatchRequest {
    private String title;
    private String body;
    private Integer userId;
}
