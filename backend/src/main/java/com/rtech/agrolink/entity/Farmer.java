package com.rtech.agrolink.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;

@Entity
@Table(name = "farmers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Farmer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 20)
    private String phone;

    @Column(nullable = false, length = 50)
    private String state;

    @Column(nullable = false, length = 50)
    private String district;

    @Column(name = "farm_size_acres", precision = 10, scale = 2)
    private BigDecimal farmSizeAcres = BigDecimal.ZERO;

    @Column(name = "upi_id", nullable = false, length = 100)
    private String upiId;

    public void updateDetails(String name, String phone, String state, String district, BigDecimal farmSize, String upiId) {
        if (name == null || name.trim().isEmpty()) {
            throw new RuntimeException("Error: Farmer name is required.");
        }
        if (phone == null || phone.trim().isEmpty()) {
            throw new RuntimeException("Error: Contact phone number is required.");
        }
        if (state == null || state.trim().isEmpty()) {
            throw new RuntimeException("Error: State location is required.");
        }
        if (district == null || district.trim().isEmpty()) {
            throw new RuntimeException("Error: District/city location is required.");
        }
        if (upiId == null || upiId.trim().isEmpty()) {
            throw new RuntimeException("Error: UPI ID is required for payments.");
        }

        this.name = name;
        this.phone = phone;
        this.state = state;
        this.district = district;
        this.farmSizeAcres = farmSize != null ? farmSize : BigDecimal.ZERO;
        this.upiId = upiId;
    }

    public static Farmer createAndValidate(User user, String name, String phone, String state, String district, BigDecimal farmSizeAcres, String upiId) {
        if (name == null || name.trim().isEmpty()) {
            throw new RuntimeException("Error: Farmer name is required.");
        }
        if (phone == null || phone.trim().isEmpty()) {
            throw new RuntimeException("Error: Contact phone number is required.");
        }
        if (state == null || state.trim().isEmpty()) {
            throw new RuntimeException("Error: State location is required.");
        }
        if (district == null || district.trim().isEmpty()) {
            throw new RuntimeException("Error: District/city location is required.");
        }
        if (upiId == null || upiId.trim().isEmpty()) {
            throw new RuntimeException("Error: UPI ID is required for payments.");
        }

        Farmer farmer = new Farmer();
        farmer.setUser(user);
        farmer.setName(name);
        farmer.setPhone(phone);
        farmer.setState(state);
        farmer.setDistrict(district);
        farmer.setFarmSizeAcres(farmSizeAcres != null ? farmSizeAcres : BigDecimal.ZERO);
        farmer.setUpiId(upiId);
        return farmer;
    }
}
