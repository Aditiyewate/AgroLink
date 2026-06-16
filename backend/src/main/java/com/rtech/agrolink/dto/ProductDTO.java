package com.rtech.agrolink.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProductDTO {
    private Long id;
    private Long farmerId;
    private String farmerName;
    private String farmerPhone;
    private String cropName;
    private String variety;
    private BigDecimal quantityQuintals;
    private BigDecimal pricePerQuintal;
    private String description;
    private String imageUrl;
    private String location;
    private String status;
    private String farmerProfilePhoto;
    private LocalDateTime createdAt;
}
