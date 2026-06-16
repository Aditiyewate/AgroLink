package com.rtech.agrolink.repository;

import com.rtech.agrolink.entity.Farmer;
import com.rtech.agrolink.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FarmerRepository extends JpaRepository<Farmer, Long> {
    Optional<Farmer> findByUser(User user);
    Optional<Farmer> findByUserEmail(String email);
}
