package com.dtt.controller;

import com.dtt.dto.LocationDTO;
import com.dtt.model.Location;
import com.dtt.model.User;
import com.dtt.service.LocationService;
import com.dtt.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api")
public class ApiLocationController {
    @Autowired
    private LocationService locationService;

    @Autowired
    private UserService userService;

    @GetMapping("/locations")
    public ResponseEntity<List<Location>> getAllLocations(){
        return ResponseEntity.ok(this.locationService.getAllLocations());
    }

    @GetMapping("/locations/{id}")
    public ResponseEntity<Location> getLocationById(@PathVariable int id){
        return ResponseEntity.ok(this.locationService.getLocationById(id));
    }

    @PostMapping("/locations/add")
    public ResponseEntity<Location> addLocation(@RequestBody LocationDTO locationDTO){
        Location location = new Location();
        location.setAddress(locationDTO.getAddress());
        location.setDistrict(locationDTO.getDistrict());
        location.setProvince(locationDTO.getProvince());
        location.setNotes(locationDTO.getNotes());

        return ResponseEntity.ok(this.locationService.addLocation(location));
    }

    @PatchMapping("/locations/{id}/update")
    public ResponseEntity<Location> updateLocation(@RequestBody LocationDTO locationDTO){
        Location location = this.locationService.getLocationById(locationDTO.getLocationId());
        location.setAddress(locationDTO.getAddress());
        location.setDistrict(locationDTO.getDistrict());
        location.setProvince(locationDTO.getProvince());
        location.setNotes(locationDTO.getNotes());

        return ResponseEntity.ok(this.locationService.updateLocation(location));
    }

    @DeleteMapping("/locations/{id}/delete")
    public ResponseEntity<String> deleteLocation(@PathVariable int id){
        Location location = this.locationService.getLocationById(id);
        this.locationService.deleteLocation(location);

        return ResponseEntity.ok("ok");
    }

}
