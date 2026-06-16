package com.rtech.agrolink.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "buyers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Buyer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "company_name", nullable = false, length = 150)
    private String companyName;

    @Column(name = "representative_name", nullable = false, length = 100)
    private String representativeName;

    @Column(nullable = false, length = 20)
    private String phone;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String address;

    @Column(length = 15)
    private String gstin;

    public static Buyer createAndValidate(User user, String companyName, String name, String phone, String address, String gstin) {
        if (companyName == null || companyName.trim().isEmpty()) {
            throw new RuntimeException("Error: Company name is required.");
        }
        if (name == null || name.trim().isEmpty()) {
            throw new RuntimeException("Error: Representative name is required.");
        }
        if (phone == null || phone.trim().isEmpty()) {
            throw new RuntimeException("Error: Phone number is required.");
        }
        if (address == null || address.trim().isEmpty()) {
            throw new RuntimeException("Error: Delivery address is required.");
        }

        Buyer buyer = new Buyer();
        buyer.setUser(user);
        buyer.setCompanyName(companyName);
        buyer.setRepresentativeName(name);
        buyer.setPhone(phone);
        buyer.setAddress(address);
        buyer.setGstin(gstin);
        return buyer;
    }

    public void updateDetails(String companyName, String name, String phone, String address, String gstin) {
        if (companyName == null || companyName.trim().isEmpty()) {
            throw new RuntimeException("Error: Company name is required.");
        }
        if (name == null || name.trim().isEmpty()) {
            throw new RuntimeException("Error: Representative name is required.");
        }
        if (phone == null || phone.trim().isEmpty()) {
            throw new RuntimeException("Error: Phone number is required.");
        }
        if (address == null || address.trim().isEmpty()) {
            throw new RuntimeException("Error: Delivery address is required.");
        }

        this.companyName = companyName;
        this.representativeName = name;
        this.phone = phone;
        this.address = address;
        this.gstin = gstin;
    }
}
