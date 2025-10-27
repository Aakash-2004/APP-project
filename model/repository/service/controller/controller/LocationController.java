package com.campus.navigation.controller;

import com.campus.navigation.model.Location;
import com.campus.navigation.service.LocationService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

// @RestController makes this class a REST API controller
@RestController
@RequestMapping("/api/locations")
@CrossOrigin("*") // Allows frontend apps (like React) to call the API
public class LocationController {

    private final LocationService locationService;

    // Constructor-based injection
    public LocationController(LocationService locationService) {
        this.locationService = locationService;
    }

    // ✅ GET: fetch all locations
    // URL: http://localhost:8080/api/locations
    @GetMapping
    public List<Location> getAllLocations() {
        return locationService.getAllLocations();
    }

    // ✅ POST: add a new location
    // URL: http://localhost:8080/api/locations
    // Example JSON:
    // {
    //   "name": "Library",
    //   "latitude": 12.9356,
    //   "longitude": 77.6192,
    //   "description": "Main campus library"
    // }
    @PostMapping
    public Location addLocation(@RequestBody Location location) {
        return locationService.addLocation(location);
    }

    // ✅ GET: fetch route between two locations (dummy route)
    // URL: http://localhost:8080/api/locations/route?start=Library&end=Canteen
    @GetMapping("/route")
    public String getRoute(@RequestParam String start, @RequestParam String end) {
        return locationService.getRoute(start, end);
    }

    // ✅ Health check endpoint
    // URL: http://localhost:8080/api/locations/health
    @GetMapping("/health")
    public String health() {
        return "✅ Campus Navigation Backend is running fine!";
    }
}
