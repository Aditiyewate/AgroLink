package com.rtech.agrolink.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDateTime;

@Entity
@Table(name = "complaints")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Complaint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(length = 50)
    private String status = "PENDING"; // 'PENDING', 'RESOLVED', 'CLOSED'

    public void resolve(String targetStatus) {
        if (targetStatus == null || targetStatus.trim().isEmpty()) {
            throw new RuntimeException("Error: Target status cannot be empty.");
        }
        this.status = targetStatus.toUpperCase();
    }

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}
