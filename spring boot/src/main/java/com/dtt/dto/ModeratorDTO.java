package com.dtt.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ModeratorDTO {

    private Integer moderatorId;
    private Integer userId;
    private LocalDateTime createdAt;
}