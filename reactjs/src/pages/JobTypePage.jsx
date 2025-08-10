import React, { useEffect, useState } from "react";
import { authApis, endpoints } from "../configs/Apis";
import { useNavigate } from "react-router";
import { FaBriefcase, FaEdit, FaTrash, FaPlus, FaArrowLeft } from "react-icons/fa";

const JobTypePage = () => {
    const [jobTypes, setJobTypes] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: ""
    });
    const [editingId, setEditingId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchJobTypes();
    }, []);

    const fetchJobTypes = async () => {
        setIsLoading(true);
        try {
            const res = await authApis().get(endpoints["jobTypes"]);
            setJobTypes(res.data);
        } catch (err) {
            console.error("Failed to fetch job types:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await authApis().put(endpoints.updateJobType(editingId), formData);
                alert("Cập nhật loại công việc thành công!");
            } else {
                await authApis().post(endpoints["createJobType"], formData);
                alert("Thêm loại công việc thành công!");
            }
            setFormData({ name: "" });
            setEditingId(null);
            setShowForm(false);
            fetchJobTypes();
        } catch (err) {
            alert(editingId ? "Cập nhật thất bại!" : "Thêm thất bại!");
            console.error(err);
        }
    };

    const handleEdit = (jobType) => {
        setFormData({
            name: jobType.name
        });
        setEditingId(jobType.jobTypeId);
        setShowForm(true);
    };

    const handleDelete = async (typeId) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa loại công việc này?")) return;
        try {
            await authApis().delete(endpoints.deleteJobType(typeId));
            alert("Xóa loại công việc thành công!");
            setJobTypes(jobTypes.filter(t => t.jobTypeId !== typeId));
        } catch (err) {
            alert("Xóa loại công việc thất bại!");
            console.error(err);
        }
    };

    const handleCancel = () => {
        setFormData({ name: "" });
        setEditingId(null);
        setShowForm(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-100 p-6">
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
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                                <FaBriefcase className="text-white text-3xl" />
                            </div>
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-2 border-white animate-pulse-slow"></div>
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold gradient-text">Quản lý loại công việc</h1>
                            <p className="text-gray-600 mt-1">Tổng cộng {jobTypes.length} loại công việc</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowForm(true)}
                        className="group relative bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 animate-slide-in-right"
                    >
                        <span className="flex items-center gap-2 relative z-10">
                            <FaPlus className="text-xl animate-pulse-slow" />
                            Thêm loại công việc
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-pink-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </button>
                </div>

                {/* Form */}
                {showForm && (
                    <div className="bg-white rounded-xl p-6 shadow-lg mb-8 animate-fade-in-up">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">
                            {editingId ? "Cập nhật loại công việc" : "Thêm loại công việc mới"}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tên loại công việc *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                                    placeholder="Nhập tên loại công việc..."
                                    required
                                    maxLength={50}
                                />
                                <p className="text-xs text-gray-500 mt-1">Tối đa 50 ký tự</p>
                            </div>
                            <div className="flex gap-4">
                                <button
                                    type="submit"
                                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
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
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                    </div>
                )}

                {/* Job Types Grid */}
                {!isLoading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {jobTypes.map((jobType, index) => (
                            <div 
                                key={jobType.jobTypeId} 
                                className="group bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105 border border-gray-100 animate-fade-in-up hover-lift"
                                style={{ animationDelay: `${index * 150}ms` }}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center">
                                            <FaBriefcase className="text-white text-xl" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{jobType.name}</h3>
                                            <p className="text-sm text-gray-500">ID: {jobType.jobTypeId}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(jobType)}
                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                                            title="Sửa"
                                        >
                                            <FaEdit className="text-sm" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(jobType.jobTypeId)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                                            title="Xóa"
                                        >
                                            <FaTrash className="text-sm" />
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="px-3 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                                            Loại công việc
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

export default JobTypePage;
