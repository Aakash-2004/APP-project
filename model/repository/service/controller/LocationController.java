package com.campus.navigation.controller;

import com.campus.navigation.model.Location;
import com.campus.navigation.service.LocationService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/locations")
@Cross
