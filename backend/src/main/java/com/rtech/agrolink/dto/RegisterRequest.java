package com.rtech.agrolink.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

@Getter
@Setter
public class RegisterRequest {
    @NotBlank
    @Size(max = 100)
    @Email
    private String email;

    @NotBlank
    @Size(min = 6, max = 40)
    private String password;

    @NotBlank
    private String role; // 'FARMER', 'BUYER', 'COLD_STORAGE_MANAGER', 'ADMIN'

    private String profilePhoto;

    // Farmer Profile Fields
    private String name; // Also used for representative name
    private String phone;
    private String state;
    private String district;
    private BigDecimal farmSizeAcres;
    private String upiId;

    // Buyer Profile Fields
    private String companyName;
    private String address;
    private String gstin;

    // Cold Storage Facility Initial Creation Fields
    private String storageName;
    private String storageLocation;
    private BigDecimal storageCapacityTons;
    private BigDecimal storagePricePerTonDay;
    private String storageDescription;
}
