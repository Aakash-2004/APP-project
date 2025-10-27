package com.campus.navigation.repository;

import com.campus.navigation.model.Location;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LocationRepository extends JpaRepository<Location, Long> {
    Location findByName(String name);
}
