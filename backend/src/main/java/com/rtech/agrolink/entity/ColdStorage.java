package com.rtech.agrolink.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.math.BigDecimal;

@Entity
@Table(name = "cold_storage")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ColdStorage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User manager; // Managed by user with role 'COLD_STORAGE_MANAGER'

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, length = 150)
    private String location;

    @Column(name = "total_capacity_tons", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalCapacityTons;

    @Column(name = "available_capacity_tons", nullable = false, precision = 10, scale = 2)
    private BigDecimal availableCapacityTons;

    @Column(name = "price_per_ton_day", nullable = false, precision = 10, scale = 2)
    private BigDecimal pricePerTonDay;

    @Column(columnDefinition = "TEXT")
    private String description;

    /**
     * Deducts capacity for a validated booking allocation.
     */
    public void allocateCapacity(BigDecimal amount) {
        BigDecimal remaining = this.availableCapacityTons.subtract(amount);
        if (remaining.compareTo(BigDecimal.ZERO) < 0) {
            throw new RuntimeException("Error: Storage is overbooked!");
        }
        this.availableCapacityTons = remaining;
    }

    /**
     * Restores capacity back to the cold storage facility, capped at total capacity.
     */
    public void restoreCapacity(BigDecimal amount) {
        BigDecimal restored = this.availableCapacityTons.add(amount);
        if (restored.compareTo(this.totalCapacityTons) > 0) {
            restored = this.totalCapacityTons;
        }
        this.availableCapacityTons = restored;
    }

    public static ColdStorage createAndValidate(User manager, String name, String location, BigDecimal totalCapacityTons, BigDecimal pricePerTonDay, String description) {
        if (name == null || name.trim().isEmpty()) {
            throw new RuntimeException("Error: Storage facility name is required.");
        }
        if (location == null || location.trim().isEmpty()) {
            throw new RuntimeException("Error: Storage location is required.");
        }
        if (totalCapacityTons == null || totalCapacityTons.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Error: Storage capacity must be a positive number.");
        }
        if (pricePerTonDay == null || pricePerTonDay.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Error: Rental rate per ton/day must be a positive number.");
        }

        ColdStorage storage = new ColdStorage();
        storage.setManager(manager);
        storage.setName(name);
        storage.setLocation(location);
        storage.setTotalCapacityTons(totalCapacityTons);
        storage.setAvailableCapacityTons(totalCapacityTons);
        storage.setPricePerTonDay(pricePerTonDay);
        storage.setDescription(description != null ? description : "IoT Temperature Controlled Space.");
        return storage;
    }

    public void updateDetails(String name, String location, BigDecimal totalCapacityTons, BigDecimal pricePerTonDay, String description) {
        if (name == null || name.trim().isEmpty()) {
            throw new RuntimeException("Error: Storage facility name is required.");
        }
        if (location == null || location.trim().isEmpty()) {
            throw new RuntimeException("Error: Storage location is required.");
        }
        if (totalCapacityTons == null || totalCapacityTons.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Error: Storage capacity must be a positive number.");
        }
        if (pricePerTonDay == null || pricePerTonDay.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Error: Rental rate per ton/day must be a positive number.");
        }

        BigDecimal diff = totalCapacityTons.subtract(this.totalCapacityTons);
        this.totalCapacityTons = totalCapacityTons;
        
        BigDecimal remaining = this.availableCapacityTons.add(diff);
        if (remaining.compareTo(BigDecimal.ZERO) < 0) {
            this.availableCapacityTons = BigDecimal.ZERO;
        } else {
            this.availableCapacityTons = remaining;
        }

        this.name = name;
        this.location = location;
        this.pricePerTonDay = pricePerTonDay;
        this.description = description;
    }
}
