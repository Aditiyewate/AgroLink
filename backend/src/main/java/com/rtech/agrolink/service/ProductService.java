package com.rtech.agrolink.service;

import com.rtech.agrolink.dto.ProductDTO;
import com.rtech.agrolink.entity.Farmer;
import com.rtech.agrolink.entity.Product;
import com.rtech.agrolink.repository.FarmerRepository;
import com.rtech.agrolink.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private FarmerRepository farmerRepository;

    @Autowired
    private NotificationService notificationService;

    @Transactional
    public ProductDTO addProduct(ProductDTO dto, String farmerEmail) {
        Farmer farmer = farmerRepository.findByUserEmail(farmerEmail)
                .orElseThrow(() -> new RuntimeException("Error: Farmer profile not found!"));

        Product product = new Product();
        product.setFarmer(farmer);
        product.setCropName(dto.getCropName());
        product.setVariety(dto.getVariety());
        product.setQuantityQuintals(dto.getQuantityQuintals());
        product.setPricePerQuintal(dto.getPricePerQuintal());
        product.setDescription(dto.getDescription());
        product.setImageUrl(dto.getImageUrl());
        product.setLocation(dto.getLocation() != null ? dto.getLocation() : farmer.getDistrict() + ", " + farmer.getState());
        product.setStatus("AVAILABLE");

        product = productRepository.save(product);

        // Broadcast global listing alert
        notificationService.sendNotification(
            null, 
            "New Crop Listed", 
            String.format("%s (%s) listed by %s at %s.", product.getCropName(), product.getVariety(), farmer.getName(), product.getLocation()), 
            "MARKETPLACE"
        );

        // Targeted alert to Admins
        notificationService.sendToAdmin(
            "New Product Listed",
            String.format("Farmer %s listed a new crop: %s (%s) - %s qtl.", 
                farmer.getName(), product.getCropName(), product.getVariety(), 
                product.getQuantityQuintals().toString()),
            "MARKETPLACE"
        );

        return convertToDTO(product);
    }

    public List<ProductDTO> getAllProducts(String crop, String location) {
        List<Product> products;
        if (crop != null && !crop.isEmpty() && location != null && !location.isEmpty()) {
            products = productRepository.findByCropNameContainingIgnoreCaseAndLocationContainingIgnoreCaseAndStatus(crop, location, "AVAILABLE");
        } else if (crop != null && !crop.isEmpty()) {
            products = productRepository.findByCropNameContainingIgnoreCaseAndStatus(crop, "AVAILABLE");
        } else if (location != null && !location.isEmpty()) {
            products = productRepository.findByLocationContainingIgnoreCaseAndStatus(location, "AVAILABLE");
        } else {
            products = productRepository.findByStatus("AVAILABLE");
        }

        return products.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public List<ProductDTO> getFarmerProducts(String email) {
        return productRepository.findByFarmerUserEmail(email).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }



    @Transactional
    public ProductDTO updateProduct(Long id, ProductDTO dto, String farmerEmail) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: Product not found!"));

        if (!product.getFarmer().getUser().getEmail().equals(farmerEmail)) {
            throw new RuntimeException("Error: Unauthorized to edit this product!");
        }

        product.updateDetails(
            dto.getCropName(),
            dto.getVariety(),
            dto.getQuantityQuintals(),
            dto.getPricePerQuintal(),
            dto.getDescription(),
            dto.getImageUrl(),
            dto.getLocation(),
            dto.getStatus()
        );

        product = productRepository.save(product);
        return convertToDTO(product);
    }

    @Transactional
    public void deleteProduct(Long id, String email) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: Product not found!"));

        if (!product.getFarmer().getUser().getEmail().equals(email)) {
            throw new RuntimeException("Error: Unauthorized to delete this product!");
        }

        productRepository.delete(product);
    }

    public ProductDTO convertToDTO(Product product) {
        ProductDTO dto = new ProductDTO();
        dto.setId(product.getId());
        dto.setFarmerId(product.getFarmer().getId());
        dto.setFarmerName(product.getFarmer().getName());
        dto.setFarmerPhone(product.getFarmer().getPhone());
        if (product.getFarmer().getUser() != null) {
            dto.setFarmerProfilePhoto(product.getFarmer().getUser().getProfilePhoto());
        }
        dto.setCropName(product.getCropName());
        dto.setVariety(product.getVariety());
        dto.setQuantityQuintals(product.getQuantityQuintals());
        dto.setPricePerQuintal(product.getPricePerQuintal());
        dto.setDescription(product.getDescription());
        dto.setImageUrl(product.getImageUrl());
        dto.setLocation(product.getLocation());
        dto.setStatus(product.getStatus());
        dto.setCreatedAt(product.getCreatedAt());
        return dto;
    }
}
