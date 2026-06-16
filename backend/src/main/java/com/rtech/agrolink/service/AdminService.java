package com.rtech.agrolink.service;

import com.rtech.agrolink.dto.AdminStatsDTO;
import com.rtech.agrolink.entity.Complaint;
import com.rtech.agrolink.entity.User;
import com.rtech.agrolink.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FarmerRepository farmerRepository;

    @Autowired
    private BuyerRepository buyerRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ComplaintRepository complaintRepository;

    public AdminStatsDTO getGlobalMetrics() {
        AdminStatsDTO dto = new AdminStatsDTO();
        dto.setTotalUsers(userRepository.count());
        dto.setTotalFarmers(userRepository.countByRole("FARMER"));
        dto.setTotalBuyers(userRepository.countByRole("BUYER"));
        dto.setTotalProducts(productRepository.count());
        dto.setTotalOrders(orderRepository.count());
        dto.setTotalComplaints(complaintRepository.count());
        return dto;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Transactional
    public User toggleUserStatus(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Error: User not found!"));

        user.toggleActive();
        return userRepository.save(user);
    }

    public List<Complaint> getAllComplaints() {
        return complaintRepository.findAll();
    }

    @Autowired
    private NotificationService notificationService;

    @Transactional
    public Complaint resolveComplaint(Long complaintId, String status) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Error: Complaint case not found!"));

        complaint.resolve(status);
        Complaint saved = complaintRepository.save(complaint);

        // Notify the specific user who submitted the complaint
        notificationService.sendNotification(
            NotificationService.getUserIdSafely(saved.getUser()),
            "Dispute Case Update",
            String.format("Your dispute ticket #COMP-%d has been marked as %s.", saved.getId(), status.toUpperCase()),
            "SYSTEM"
        );

        return saved;
    }

    public void updateSystemParameters(double commission, double insurance) {
        notificationService.sendNotification(
            null,
            "System Configuration Modified",
            String.format("Platform escrow commission adjusted to %.1f%% and logistics transit insurance set to ₹%,.0f.", commission, insurance),
            "SYSTEM"
        );
    }
}
