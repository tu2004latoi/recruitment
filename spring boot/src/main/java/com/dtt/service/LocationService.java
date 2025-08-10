package com.dtt.service;

import com.dtt.model.Location;
import com.dtt.model.User;
import com.dtt.repository.LocationRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class LocationService {
    @Autowired
    private LocationRepository locationRepository;

    public List<Location> getAllLocations(){
        return this.locationRepository.findAll();
    }

    public Location getLocationById(int id){
        Optional<Location> location = this.locationRepository.findById(id);

        return location.orElse(null);
    }

    @Transactional
    public Location addLocation(Location location){
        if (location.getLocationId() != null){
            throw new IllegalArgumentException("New Location must not have an ID");
        }
        return this.locationRepository.save(location);
    }

    @Transactional
    public Location updateLocation(Location location){
        if (location.getLocationId() == null || !locationRepository.existsById(location.getLocationId())) {
            throw new EntityNotFoundException("Location not found with ID: " + location.getLocationId());
        }

        return this.locationRepository.save(location);
    }

    @Transactional
    public void deleteLocation(Location location){
        if (location == null){
            throw new EntityNotFoundException("Not found Location");
        }
        this.locationRepository.delete(location);
    }
}
