package com.rtech.agrolink.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "buyer_id", nullable = false)
    private Buyer buyer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "quantity_quintals", nullable = false, precision = 10, scale = 2)
    private BigDecimal quantityQuintals;

    @Column(name = "total_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalPrice;

    @Column(length = 50)
    private String status = "PENDING"; // 'PENDING', 'APPROVED', 'SHIPPED', 'DELIVERED', 'CANCELLED'

    public void transitionTo(OrderStatus targetStatus, String role) {
        OrderStatus currentStatusEnum = OrderStatus.valueOf(this.status);
        if (!OrderStatus.isValidTransition(currentStatusEnum, targetStatus, role)) {
            throw new RuntimeException(String.format("Error: Unauthorized or invalid state transition from %s to %s for role %s", 
                this.status, targetStatus, role));
        }
        
        // Handle inventory side-effects of transition
        if ((targetStatus == OrderStatus.REJECTED || targetStatus == OrderStatus.CANCELLED) && 
                currentStatusEnum != OrderStatus.REJECTED && currentStatusEnum != OrderStatus.CANCELLED) {
            this.product.restoreQuantity(this.quantityQuintals);
        }
        
        this.status = targetStatus.name();
    }

    @Column(name = "estimated_delivery_date")
    private java.time.LocalDate estimatedDeliveryDate;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}
