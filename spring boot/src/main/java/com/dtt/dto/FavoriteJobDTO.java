package com.dtt.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class FavoriteJobDTO {
    private Integer favoriteJobId;
    private Integer jobId;
    private Integer userId;
    private LocalDateTime favoritedAt;
}