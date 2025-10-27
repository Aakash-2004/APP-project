package com.campus.navigation.service;

import com.campus.navigation.model.Location;
import com.campus.navigation.repository.LocationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LocationService {

    private final LocationRepository locationRepository;

    public LocationService(LocationRepository locationRepository) {
        this.locationRepository = locationRepository;
    }

    public List<Location> getAllLocations() {
        return locationRepository.findAll();
    }

    public Location addLocation(Location location) {
        return locationRepository.save(location);
    }

    public String getRoute(String start, String end) {
        Location s = locationRepository.findByName(start);
        Location e = locationRepository.findByName(end);
        if (s == null || e == null)
            return "❌ Invalid locations";
        return "Dummy route from " + s.getName() + " → " + e.getName() + " 🗺️";
    }
}
