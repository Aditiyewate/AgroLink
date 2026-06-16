package com.rtech.agrolink.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProfileUpdateRequest {
    private String profilePhoto;
    private String name;
    private String phone;
    private String state;
    private String district;
    private BigDecimal farmSizeAcres;
    private String upiId;

    // Buyer Profile Fields
    private String companyName;
    private String address;
    private String gstin;

    // Cold Storage Facility Fields
    private String storageName;
    private String storageLocation;
    private BigDecimal storageCapacityTons;
    private BigDecimal storagePricePerTonDay;
    private String storageDescription;
}
