package com.rtech.agrolink.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StorageBookingDTO {
    private Long id;
    private Long farmerId;
    private String farmerName;
    private String farmerPhone;
    private Long buyerId;
    private String buyerName;
    private String buyerPhone;
    private Long coldStorageId;
    private String storageName;
    private String storageLocation;
    private BigDecimal quantityTons;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal totalPrice;
    private String status;
    private String farmerProfilePhoto;
    private String buyerProfilePhoto;
    private String rejectionReason;
    private LocalDateTime createdAt;
}
