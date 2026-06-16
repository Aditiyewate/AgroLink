package com.rtech.agrolink.repository;

import com.rtech.agrolink.entity.Buyer;
import com.rtech.agrolink.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BuyerRepository extends JpaRepository<Buyer, Long> {
    Optional<Buyer> findByUser(User user);
    Optional<Buyer> findByUserEmail(String email);
}
