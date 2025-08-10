import React, { useState, useEffect } from 'react';
import { FaMapMarkerAlt } from 'react-icons/fa';
import LocationService from '../services/LocationService';

const LocationDisplay = ({ locationId, locationString, jobLocation, className = "" }) => {
  const [location, setLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (jobLocation) {
      // Ưu tiên jobLocation nếu có
      setLocation(LocationService.formatJobLocation(jobLocation));
    } else if (locationId) {
      fetchLocation();
    } else if (locationString) {
      setLocation(locationString);
    }
  }, [locationId, locationString, jobLocation]);

  const fetchLocation = async () => {
    setIsLoading(true);
    try {
      const locationData = await LocationService.getLocationById(locationId);
      setLocation(LocationService.formatLocation(locationData));
    } catch (error) {
      console.error("Error fetching location:", error);
      setLocation("Không xác định");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 text-gray-500 ${className}`}>
        <FaMapMarkerAlt className="text-blue-500" />
        <span className="text-sm">Đang tải...</span>
      </div>
    );
  }

  if (!location) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 text-gray-600 ${className}`}>
      <FaMapMarkerAlt className="text-blue-500" />
      <span className="text-sm">{location}</span>
    </div>
  );
};

export default LocationDisplay; 