import React, { useState, useEffect, useContext } from 'react';
import { FaMapMarkerAlt, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import LocationService from '../services/LocationService';
import { MyUserContext } from '../configs/MyContexts';
import { authApis, endpoints } from '../configs/Apis';

const LocationSelector = ({ 
  selectedLocationId, 
  onLocationChange, 
  showCreateForm = false,
  className = "" 
}) => {
  const user = useContext(MyUserContext);
  const [locations, setLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(showCreateForm);
  const [hasLocations, setHasLocations] = useState(false);
  const [newLocation, setNewLocation] = useState({
    province: "",
    district: "",
    address: "",
    notes: ""
  });

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    setIsLoading(true);
    try {
      // Sử dụng LocationService để lấy location từ current user
      const userLocation = await LocationService.getCurrentUserLocation();
      
      if (userLocation) {
        setLocations([userLocation]);
        setHasLocations(true);
      } else {
        setLocations([]);
        setHasLocations(false);
      }
    } catch (error) {
      console.error("Error getting user location:", error);
      setLocations([]);
      setHasLocations(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateLocation = async () => {
    
    // Validation
    if (!newLocation.province || !newLocation.district || !newLocation.address) {
      alert("Vui lòng điền đầy đủ thông tin địa chỉ!");
      return;
    }
    
    setIsLoading(true);
    try {
      const createdLocation = await LocationService.createLocation(newLocation);
      
      if (createdLocation && createdLocation.locationId) {
        // Refresh lại danh sách locations để đảm bảo có đầy đủ thông tin
        await fetchLocations();
        setNewLocation({ province: "", district: "", address: "", notes: "" });
        setShowCreate(false);
        // Tự động chọn location vừa tạo
        console.log("LocationSelector: Auto-selecting created location:", createdLocation.locationId);
        onLocationChange(createdLocation.locationId);
        alert("Tạo địa chỉ thành công!");
      } else {
        throw new Error("Không nhận được locationId từ server");
      }
    } catch (error) {
      console.error("Error creating location:", error);
      alert("Tạo địa chỉ thất bại: " + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationSelect = (locationId) => {
    console.log("LocationSelector: Location selected:", locationId);
    onLocationChange(locationId);
  };

  const formatLocationDisplay = (location) => {
    const parts = [];
    if (location.province) parts.push(location.province);
    if (location.district) parts.push(location.district);
    if (location.address) parts.push(location.address);
    return parts.join(", ") || "Chưa có địa chỉ";
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Location Selector */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Địa chỉ
        </label>
        
        {/* Existing Locations */}
        {hasLocations && (
          <div className="space-y-2">
            {Array.isArray(locations) && locations.map((location) => (
              <div
                key={location.locationId}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedLocationId === location.locationId
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => handleLocationSelect(location.locationId)}
              >
                <div className="flex items-center gap-2">
                  <FaMapMarkerAlt className="text-blue-500" />
                  <span className="text-sm text-gray-700">
                    {formatLocationDisplay(location)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create New Location Button - Only show if there are existing locations */}
        {hasLocations && !showCreate && (
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors flex items-center justify-center gap-2"
          >
            <FaPlus className="text-sm" />
            <span>Thêm địa chỉ mới</span>
          </button>
        )}

        {/* Create Location Form - Show when no locations exist or when user wants to create new */}
        {(!hasLocations || showCreate) && (
          <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
            <h4 className="font-medium text-gray-900 mb-3">
              {!hasLocations ? "Tạo địa chỉ mới (Bắt buộc)" : "Thêm địa chỉ mới"}
            </h4>
                         <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tỉnh/Thành phố
                </label>
                <input
                  type="text"
                  value={newLocation.province}
                  onChange={(e) => setNewLocation({...newLocation, province: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Ví dụ: Hà Nội"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quận/Huyện
                </label>
                <input
                  type="text"
                  value={newLocation.district}
                  onChange={(e) => setNewLocation({...newLocation, district: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Ví dụ: Cầu Giấy"
                  required
                />
              </div>
              
                               <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">
                     Địa chỉ chi tiết
                   </label>
                   <input
                     type="text"
                     value={newLocation.address}
                     onChange={(e) => setNewLocation({...newLocation, address: e.target.value})}
                     className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                     placeholder="Ví dụ: 123 Đường ABC"
                     required
                   />
                 </div>
                 
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">
                     Ghi chú
                   </label>
                   <textarea
                     value={newLocation.notes}
                     onChange={(e) => setNewLocation({...newLocation, notes: e.target.value})}
                     className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                     placeholder="Ghi chú về địa chỉ (tùy chọn)"
                     rows="3"
                   />
                 </div>
              
              <div className="flex gap-2">
                                 <button
                   type="button"
                   onClick={handleCreateLocation}
                   disabled={isLoading}
                   className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                   {isLoading ? "Đang tạo..." : "Tạo địa chỉ"}
                 </button>
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
                >
                  Hủy
                </button>
                             </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationSelector; 