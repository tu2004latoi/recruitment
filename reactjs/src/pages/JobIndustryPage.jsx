import React, { useEffect, useState } from "react";
import { authApis, endpoints } from "../configs/Apis";
import { useNavigate } from "react-router";
import { FaIndustry, FaEdit, FaTrash, FaPlus, FaArrowLeft } from "react-icons/fa";

const JobIndustryPage = () => {
    const [industries, setIndustries] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: ""
    });
    const [editingId, setEditingId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchIndustries();
    }, []);

    const fetchIndustries = async () => {
        setIsLoading(true);
        try {
            const res = await authApis().get(endpoints["jobIndustries"]);
            setIndustries(res.data);
        } catch (err) {
            console.error("Failed to fetch industries:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await authApis().put(endpoints.updateJobIndustry(editingId), formData);
                alert("Cập nhật ngành nghề thành công!");
            } else {
                await authApis().post(endpoints["createJobIndustry"], formData);
                alert("Thêm ngành nghề thành công!");
            }
            setFormData({ name: "" });
            setEditingId(null);
            setShowForm(false);
            fetchIndustries();
        } catch (err) {
            alert(editingId ? "Cập nhật thất bại!" : "Thêm thất bại!");
            console.error(err);
        }
    };

    const handleEdit = (industry) => {
        setFormData({
            name: industry.name
        });
        setEditingId(industry.industryId);
        setShowForm(true);
    };

    const handleDelete = async (industryId) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa ngành nghề này?")) return;
        try {
            await authApis().delete(endpoints.deleteJobIndustry(industryId));
            alert("Xóa ngành nghề thành công!");
            setIndustries(industries.filter(i => i.industryId !== industryId));
        } catch (err) {
            alert("Xóa ngành nghề thất bại!");
            console.error(err);
        }
    };

    const handleCancel = () => {
        setFormData({ name: "" });
        setEditingId(null);
        setShowForm(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-red-100 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8 animate-fade-in-up">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-all duration-200"
                        >
                            <FaArrowLeft className="text-xl" />
                        </button>
                        <div className="relative animate-pulse-slow">
                            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                                <FaIndustry className="text-white text-3xl" />
                            </div>
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-2 border-white animate-pulse-slow"></div>
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold gradient-text">Quản lý ngành nghề</h1>
                            <p className="text-gray-600 mt-1">Tổng cộng {industries.length} ngành nghề</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowForm(true)}
                        className="group relative bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 animate-slide-in-right"
                    >
                        <span className="flex items-center gap-2 relative z-10">
                            <FaPlus className="text-xl animate-pulse-slow" />
                            Thêm ngành nghề
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-700 to-red-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </button>
                </div>

                {/* Form */}
                {showForm && (
                    <div className="bg-white rounded-xl p-6 shadow-lg mb-8 animate-fade-in-up">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">
                            {editingId ? "Cập nhật ngành nghề" : "Thêm ngành nghề mới"}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tên ngành nghề *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                                    placeholder="Nhập tên ngành nghề..."
                                    required
                                    maxLength={100}
                                />
                                <p className="text-xs text-gray-500 mt-1">Tối đa 100 ký tự</p>
                            </div>
                            <div className="flex gap-4">
                                <button
                                    type="submit"
                                    className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
                                >
                                    {editingId ? "Cập nhật" : "Thêm mới"}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-all duration-200"
                                >
                                    Hủy
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Loading State */}
                {isLoading && (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
                    </div>
                )}

                {/* Industries Grid */}
                {!isLoading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {industries.map((industry, index) => (
                            <div 
                                key={industry.industryId} 
                                className="group bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105 border border-gray-100 animate-fade-in-up hover-lift"
                                style={{ animationDelay: `${index * 150}ms` }}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center">
                                            <FaIndustry className="text-white text-xl" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{industry.name}</h3>
                                            <p className="text-sm text-gray-500">ID: {industry.industryId}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(industry)}
                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                                            title="Sửa"
                                        >
                                            <FaEdit className="text-sm" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(industry.industryId)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                                            title="Xóa"
                                        >
                                            <FaTrash className="text-sm" />
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="px-3 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                                            Ngành nghề
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default JobIndustryPage;
