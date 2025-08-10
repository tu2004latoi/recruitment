package com.dtt.dto;

import lombok.Data;

@Data
public class InterviewLocationDTO {

    private Integer interviewLocationId; // null khi tạo mới

    private String province;  // Tỉnh/Thành phố

    private String district;  // Quận/Huyện

    private String address;   // Địa chỉ cụ thể

    private String notes;     // Ghi chú (VD: hướng dẫn đi lại, chỉ đường)
}
