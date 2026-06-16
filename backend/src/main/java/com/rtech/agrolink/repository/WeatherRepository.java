package com.rtech.agrolink.repository;

import com.rtech.agrolink.entity.Weather;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WeatherRepository extends JpaRepository<Weather, Long> {
    Optional<Weather> findByLocationContainingIgnoreCase(String location);
}
