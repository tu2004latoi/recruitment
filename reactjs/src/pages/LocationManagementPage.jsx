import React, { useState, useEffect } from 'react';
import { authApis, endpoints } from '../configs/Apis';
import { FaMapMarkerAlt, FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import LocationService from '../services/LocationService';

const LocationManagementPage = () => {
  const [locations, setLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [formData, setFormData] = useState({
    province: "",
    district: "",
    address: ""
  });

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    setIsLoading(true);
    try {
      const data = await LocationService.getAllLocations();
      // Ensure data is an array
      if (Array.isArray(data)) {
        setLocations(data);
      } else if (data && Array.isArray(data.data)) {
        // If the response has a data property containing the array
        setLocations(data.data);
      } else {
        console.error("Unexpected data format:", data);
        setLocations([]);
        alert("Dữ liệu không đúng định dạng!");
      }
    } catch (error) {
      console.error("Error fetching locations:", error);
      setLocations([]);
      alert("Không thể tải danh sách địa chỉ!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (editingLocation) {
        await LocationService.updateLocation(editingLocation.locationId, formData);
        alert("Cập nhật địa chỉ thành công!");
      } else {
        await LocationService.createLocation(formData);
        alert("Tạo địa chỉ thành công!");
      }
      setShowCreateForm(false);
      setEditingLocation(null);
      setFormData({ province: "", district: "", address: "" });
      fetchLocations();
    } catch (error) {
      alert(editingLocation ? "Cập nhật địa chỉ thất bại!" : "Tạo địa chỉ thất bại!");
      console.error("Error saving location:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (location) => {
    setEditingLocation(location);
    setFormData({
      province: location.province || "",
      district: location.district || "",
      address: location.address || ""
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (locationId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa địa chỉ này?")) {
      return;
    }
    
    setIsLoading(true);
    try {
      await LocationService.deleteLocation(locationId);
      alert("Xóa địa chỉ thành công!");
      fetchLocations();
    } catch (error) {
      alert("Xóa địa chỉ thất bại!");
      console.error("Error deleting location:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setShowCreateForm(false);
    setEditingLocation(null);
    setFormData({ province: "", district: "", address: "" });
  };

  const filteredLocations = (Array.isArray(locations) ? locations : []).filter(location => {
    const searchLower = searchTerm.toLowerCase();
    return (
      location.province?.toLowerCase().includes(searchLower) ||
      location.district?.toLowerCase().includes(searchLower) ||
      location.address?.toLowerCase().includes(searchLower)
    );
  });

  const formatLocation = (location) => {
    const parts = [];
    if (location.province) parts.push(location.province);
    if (location.district) parts.push(location.district);
    if (location.address) parts.push(location.address);
    return parts.join(", ") || "Chưa có địa chỉ";
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Quản lý địa chỉ</h1>
                <p className="text-sm text-gray-600 mt-1">Quản lý tất cả địa chỉ trong hệ thống</p>
              </div>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <FaPlus />
                Thêm địa chỉ
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm địa chỉ..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Create/Edit Form */}
          {showCreateForm && (
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {editingLocation ? "Cập nhật địa chỉ" : "Thêm địa chỉ mới"}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tỉnh/Thành phố *
                    </label>
                    <input
                      type="text"
                      value={formData.province}
                      onChange={(e) => setFormData({...formData, province: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ví dụ: Hà Nội"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quận/Huyện *
                    </label>
                    <input
                      type="text"
                      value={formData.district}
                      onChange={(e) => setFormData({...formData, district: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ví dụ: Cầu Giấy"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Địa chỉ chi tiết *
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ví dụ: 123 Đường ABC"
                      required
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "Đang lưu..." : (editingLocation ? "Cập nhật" : "Tạo")}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Locations List */}
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="px-6 py-8 text-center">
                <div className="text-gray-500">Đang tải...</div>
              </div>
            ) : filteredLocations.length === 0 ? (
              <div className="px-6 py-8 text-center">
                <FaMapMarkerAlt className="mx-auto text-gray-400 text-4xl mb-4" />
                <div className="text-gray-500">
                  {searchTerm ? "Không tìm thấy địa chỉ nào" : "Chưa có địa chỉ nào"}
                </div>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Địa chỉ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Người dùng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Array.isArray(filteredLocations) && filteredLocations.map((location) => (
                    <tr key={location.locationId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {location.locationId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <FaMapMarkerAlt className="text-blue-500" />
                          <span className="text-sm text-gray-900">
                            {formatLocation(location)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {location.userId || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(location)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(location.locationId)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationManagementPage; 