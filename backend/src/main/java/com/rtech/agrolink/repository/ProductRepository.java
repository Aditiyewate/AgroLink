package com.rtech.agrolink.repository;

import com.rtech.agrolink.entity.Farmer;
import com.rtech.agrolink.entity.Product;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByFarmer(Farmer farmer);

    @EntityGraph(attributePaths = {"farmer"})
    List<Product> findByFarmerUserEmail(String email);

    @EntityGraph(attributePaths = {"farmer"})
    List<Product> findByStatus(String status);

    @EntityGraph(attributePaths = {"farmer"})
    List<Product> findByCropNameContainingIgnoreCaseAndStatus(String cropName, String status);

    @EntityGraph(attributePaths = {"farmer"})
    List<Product> findByLocationContainingIgnoreCaseAndStatus(String location, String status);

    @EntityGraph(attributePaths = {"farmer"})
    List<Product> findByCropNameContainingIgnoreCaseAndLocationContainingIgnoreCaseAndStatus(
            String cropName, String location, String status);
}
