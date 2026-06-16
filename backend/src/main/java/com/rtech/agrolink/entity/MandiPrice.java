package com.rtech.agrolink.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "mandi_prices")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MandiPrice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "crop_name", nullable = false, length = 100)
    private String cropName;

    @Column(length = 100)
    private String variety;

    @Column(name = "market_name", nullable = false, length = 100)
    private String marketName;

    @Column(nullable = false, length = 50)
    private String state;

    @Column(name = "price_per_quintal", nullable = false, precision = 10, scale = 2)
    private BigDecimal pricePerQuintal;

    @Column(name = "price_change_yesterday", nullable = false, precision = 10, scale = 2)
    private BigDecimal priceChangeYesterday;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;

    public void fluctuate(double change) {
        BigDecimal oldPrice = this.pricePerQuintal;
        BigDecimal diff = BigDecimal.valueOf(change).setScale(2, java.math.RoundingMode.HALF_UP);
        BigDecimal newPrice = oldPrice.add(diff).setScale(2, java.math.RoundingMode.HALF_UP);

        BigDecimal minPrice = BigDecimal.valueOf(10.0);
        BigDecimal maxPrice = BigDecimal.valueOf(999999.99);

        if (this.id != null) {
            if (this.id == 1) { // Onion
                minPrice = BigDecimal.valueOf(1400.0);
                maxPrice = BigDecimal.valueOf(2500.0);
            } else if (this.id == 2) { // Grapes
                minPrice = BigDecimal.valueOf(6000.0);
                maxPrice = BigDecimal.valueOf(9500.0);
            } else if (this.id == 3) { // Sugarcane
                minPrice = BigDecimal.valueOf(250.0);
                maxPrice = BigDecimal.valueOf(450.0);
            } else if (this.id == 4) { // Soybean
                minPrice = BigDecimal.valueOf(3800.0);
                maxPrice = BigDecimal.valueOf(5500.0);
            } else if (this.id == 5) { // Alphonso Mango
                minPrice = BigDecimal.valueOf(9000.0);
                maxPrice = BigDecimal.valueOf(17000.0);
            }
        }

        if (newPrice.compareTo(minPrice) < 0) {
            newPrice = minPrice;
            diff = newPrice.subtract(oldPrice);
        } else if (newPrice.compareTo(maxPrice) > 0) {
            newPrice = maxPrice;
            diff = newPrice.subtract(oldPrice);
        }

        this.pricePerQuintal = newPrice;

        BigDecimal newChange = this.priceChangeYesterday.add(diff).setScale(2, java.math.RoundingMode.HALF_UP);
        if (newChange.compareTo(BigDecimal.valueOf(999.99)) > 0) {
            newChange = BigDecimal.valueOf(999.99);
        } else if (newChange.compareTo(BigDecimal.valueOf(-999.99)) < 0) {
            newChange = BigDecimal.valueOf(-999.99);
        }
        this.priceChangeYesterday = newChange;
    }
}
