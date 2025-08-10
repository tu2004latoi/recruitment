import { authApis, endpoints } from "../configs/Apis";

export class LocationService {
  // Lấy tất cả locations
  static async getAllLocations() {
    try {
      const response = await authApis().get(endpoints.locations);
      // Ensure we return an array
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        return response.data.data;
      } else {
        console.error("Unexpected response format:", response.data);
        return [];
      }
    } catch (error) {
      console.error("Error fetching locations:", error);
      throw error;
    }
  }

  // Lấy location theo ID
  static async getLocationById(locationId) {
    try {
      const response = await authApis().get(endpoints.locationDetail(locationId));
      return response.data;
    } catch (error) {
      console.error("Error fetching location:", error);
      throw error;
    }
  }



  // Tạo location mới
  static async createLocation(locationData) {
    try {
      // Đảm bảo locationData có đủ các trường cần thiết
      const locationPayload = {
        province: locationData.province || "",
        district: locationData.district || "",
        address: locationData.address || "",
        notes: locationData.notes || ""
        // userId sẽ được backend tự động gán từ token hiện tại
      };
      
      const response = await authApis().post(endpoints.createLocation, locationPayload);
      return response.data;
    } catch (error) {
      console.error("Error creating location:", error);
      throw error;
    }
  }

  // Cập nhật location
  static async updateLocation(locationId, locationData) {
    try {
      const response = await authApis().put(endpoints.updateLocation(locationId), locationData);
      return response.data;
    } catch (error) {
      console.error("Error updating location:", error);
      throw error;
    }
  }

  // Xóa location
  static async deleteLocation(locationId) {
    try {
      const response = await authApis().delete(endpoints.deleteLocation(locationId));
      return response.data;
    } catch (error) {
      console.error("Error deleting location:", error);
      throw error;
    }
  }

  // Format location để hiển thị
  static formatLocation(location) {
    if (!location) return "";
    
    const parts = [];
    if (location.province) parts.push(location.province);
    if (location.district) parts.push(location.district);
    if (location.address) parts.push(location.address);
    
    let result = parts.join(", ");
    
    // Thêm notes nếu có
    if (location.notes) {
      result += ` (${location.notes})`;
    }
    
    return result;
  }

  // Format location từ job object
  static formatJobLocation(jobLocation) {
    if (!jobLocation) return "Không xác định";
    
    if (typeof jobLocation === 'object') {
      const parts = [];
      if (jobLocation.province) parts.push(jobLocation.province);
      if (jobLocation.district) parts.push(jobLocation.district);
      if (jobLocation.address) parts.push(jobLocation.address);
      
      let result = parts.join(", ");
      
      // Thêm notes nếu có
      if (jobLocation.notes) {
        result += ` (${jobLocation.notes})`;
      }
      
      return result;
    }
    
    return jobLocation;
  }

  // Format location từ job object (alias cho formatJobLocation)
  static formatLocationFromJob(jobLocation) {
    return this.formatJobLocation(jobLocation);
  }

  // Lấy location từ current user
  static async getCurrentUserLocation() {
    try {
      const userRes = await authApis().get(endpoints.currentUser);
      const currentUser = userRes.data;
      
      // Lấy location từ recruiter hoặc applicant
      if (currentUser.role === 'RECRUITER' && currentUser.recruiter && currentUser.recruiter.location) {
        return currentUser.recruiter.location;
      } else if (currentUser.role === 'APPLICANT' && currentUser.applicant && currentUser.applicant.location) {
        return currentUser.applicant.location;
      }
      
      return null;
    } catch (error) {
      console.error("Error getting current user location:", error);
      return null;
    }
  }

  // Parse location string thành object
  static parseLocationString(locationString) {
    if (!locationString) return null;
    
    const parts = locationString.split(",").map(part => part.trim());
    return {
      province: parts[0] || "",
      district: parts[1] || "",
      address: parts.slice(2).join(", ") || ""
    };
  }
}

export default LocationService; 