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
public class OrderDTO {
    private Long id;
    private Long buyerId;
    private String buyerCompanyName;
    private String buyerRepresentativeName;
    private String buyerPhone;
    private String buyerAddress;
    private Long productId;
    private String cropName;
    private String variety;
    private BigDecimal pricePerQuintal;
    private BigDecimal quantityQuintals;
    private BigDecimal totalPrice;
    private String status;
    private java.time.LocalDate estimatedDeliveryDate;
    private String buyerProfilePhoto;
    private String farmerName;
    private String farmerPhone;
    private String farmerProfilePhoto;
    private LocalDateTime createdAt;
}
