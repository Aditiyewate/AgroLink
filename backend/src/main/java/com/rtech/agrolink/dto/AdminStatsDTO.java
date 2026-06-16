package com.rtech.agrolink.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AdminStatsDTO {
    private long totalUsers;
    private long totalFarmers;
    private long totalBuyers;
    private long totalProducts;
    private long totalOrders;
    private long totalComplaints;
}
