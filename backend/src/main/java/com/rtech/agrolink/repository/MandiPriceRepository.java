package com.rtech.agrolink.repository;

import com.rtech.agrolink.entity.MandiPrice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MandiPriceRepository extends JpaRepository<MandiPrice, Long> {
    List<MandiPrice> findByCropNameContainingIgnoreCase(String cropName);
}
