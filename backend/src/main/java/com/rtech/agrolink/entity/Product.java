package com.rtech.agrolink.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farmer_id", nullable = false)
    private Farmer farmer;

    @Column(name = "crop_name", nullable = false, length = 100)
    private String cropName;

    @Column(length = 100)
    private String variety;

    @Column(name = "quantity_quintals", nullable = false, precision = 10, scale = 2)
    private BigDecimal quantityQuintals;

    @Column(name = "price_per_quintal", nullable = false, precision = 10, scale = 2)
    private BigDecimal pricePerQuintal;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Lob
    @Column(name = "image_url", columnDefinition = "LONGTEXT")
    private String imageUrl;

    @Column(nullable = false, length = 150)
    private String location;

    @Column(length = 50)
    private String status = "AVAILABLE"; // 'AVAILABLE', 'SOLD', 'RESERVED'

    public void validateAvailability(BigDecimal quantity) {
        if (!"AVAILABLE".equals(this.status)) {
            throw new RuntimeException("Error: Product is no longer available!");
        }
        if (this.quantityQuintals.compareTo(quantity) < 0) {
            throw new RuntimeException("Error: Insufficient quantity available!");
        }
    }

    public void deductQuantity(BigDecimal quantity) {
        validateAvailability(quantity);
        this.quantityQuintals = this.quantityQuintals.subtract(quantity);
        if (this.quantityQuintals.compareTo(BigDecimal.ZERO) == 0) {
            this.status = "SOLD";
        }
    }

    public void restoreQuantity(BigDecimal quantity) {
        this.quantityQuintals = this.quantityQuintals.add(quantity);
        if ("SOLD".equals(this.status)) {
            this.status = "AVAILABLE";
        }
    }

    public void updateDetails(String cropName, String variety, BigDecimal quantity, BigDecimal price, String description, String imageUrl, String location, String targetStatus) {
        this.cropName = cropName;
        this.variety = variety;
        this.quantityQuintals = quantity;
        this.pricePerQuintal = price;
        this.description = description;
        this.imageUrl = imageUrl;
        this.location = location;
        if (targetStatus != null) {
            this.status = targetStatus;
        }
    }

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}
