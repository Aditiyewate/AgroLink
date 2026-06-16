package com.rtech.agrolink.controller;

import com.rtech.agrolink.dto.AdminStatsDTO;
import com.rtech.agrolink.entity.Complaint;
import com.rtech.agrolink.entity.MandiPrice;
import com.rtech.agrolink.entity.User;
import com.rtech.agrolink.repository.MandiPriceRepository;
import com.rtech.agrolink.config.LiveFeedWebSocketHandler;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rtech.agrolink.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private MandiPriceRepository mandiPriceRepository;

    @Autowired
    private LiveFeedWebSocketHandler webSocketHandler;

    private final ObjectMapper objectMapper = new ObjectMapper();

    // Get all Mandi Prices for Admin Panel
    @GetMapping("/mandi")
    public ResponseEntity<List<MandiPrice>> getAdminMandiRates() {
        return ResponseEntity.ok(mandiPriceRepository.findAll());
    }

    // Add new Mandi Price record
    @PostMapping("/mandi")
    public ResponseEntity<?> addMandiRate(@RequestBody MandiPrice newPrice) {
        try {
            if (newPrice.getPriceChangeYesterday() == null) {
                newPrice.setPriceChangeYesterday(java.math.BigDecimal.ZERO);
            }
            MandiPrice savedPrice = mandiPriceRepository.save(newPrice);
            broadcastMandiUpdate(savedPrice);
            return ResponseEntity.ok(savedPrice);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Edit Mandi Price record
    @PutMapping("/mandi/{id}")
    public ResponseEntity<?> updateMandiRate(@PathVariable Long id, @RequestBody MandiPrice updatedFields) {
        try {
            MandiPrice cropPrice = mandiPriceRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Error: Mandi Price record not found!"));
            
            cropPrice.setCropName(updatedFields.getCropName());
            cropPrice.setVariety(updatedFields.getVariety());
            cropPrice.setMarketName(updatedFields.getMarketName());
            cropPrice.setState(updatedFields.getState());
            cropPrice.setPricePerQuintal(updatedFields.getPricePerQuintal());
            if (updatedFields.getPriceChangeYesterday() != null) {
                cropPrice.setPriceChangeYesterday(updatedFields.getPriceChangeYesterday());
            }
            
            MandiPrice savedPrice = mandiPriceRepository.save(cropPrice);
            broadcastMandiUpdate(savedPrice);
            return ResponseEntity.ok(savedPrice);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Delete Mandi Price record
    @DeleteMapping("/mandi/{id}")
    public ResponseEntity<?> deleteMandiRate(@PathVariable Long id) {
        try {
            mandiPriceRepository.deleteById(id);
            // Broadcast delete action or just update trigger
            java.util.Map<String, Object> message = new java.util.HashMap<>();
            message.put("type", "MANDI_DELETE");
            message.put("id", id);
            String payload = objectMapper.writeValueAsString(message);
            webSocketHandler.broadcast(payload);
            return ResponseEntity.ok("Mandi Price record deleted successfully.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    private void broadcastMandiUpdate(MandiPrice cropPrice) {
        try {
            java.util.Map<String, Object> message = new java.util.HashMap<>();
            message.put("type", "MANDI_UPDATE");
            message.put("id", cropPrice.getId());
            message.put("cropName", cropPrice.getCropName());
            message.put("variety", cropPrice.getVariety());
            message.put("marketName", cropPrice.getMarketName());
            message.put("pricePerQuintal", cropPrice.getPricePerQuintal());
            message.put("priceChangeYesterday", cropPrice.getPriceChangeYesterday());

            String payload = objectMapper.writeValueAsString(message);
            webSocketHandler.broadcast(payload);
        } catch (Exception e) {
            System.err.println("Failed to broadcast Admin Mandi WebSocket update: " + e.getMessage());
        }
    }

    // View global platform metrics
    @GetMapping("/metrics")
    public ResponseEntity<AdminStatsDTO> getGlobalMetrics() {
        return ResponseEntity.ok(adminService.getGlobalMetrics());
    }

    // View registered users list
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    // Toggle user status (Activate/Deactivate)
    @PatchMapping("/users/{id}/toggle")
    public ResponseEntity<?> toggleUserStatus(@PathVariable Long id) {
        try {
            User updatedUser = adminService.toggleUserStatus(id);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // View system disputes/complaints list
    @GetMapping("/complaints")
    public ResponseEntity<List<Complaint>> getAllComplaints() {
        return ResponseEntity.ok(adminService.getAllComplaints());
    }

    // Update complaint resolution status
    @PutMapping("/complaints/{id}/status")
    public ResponseEntity<?> resolveComplaint(@PathVariable Long id, @RequestParam String status) {
        try {
            Complaint resolvedComplaint = adminService.resolveComplaint(id, status);
            return ResponseEntity.ok(resolvedComplaint);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Configure system parameters (escrow commission, logistics cover)
    @PostMapping("/settings")
    public ResponseEntity<?> updateSettings(@RequestParam double commission, @RequestParam double insurance) {
        try {
            adminService.updateSystemParameters(commission, insurance);
            return ResponseEntity.ok("System parameters updated successfully.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
