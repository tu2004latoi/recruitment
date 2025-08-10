import React, { useEffect, useState } from "react";
import { authApis, endpoints } from "../configs/Apis";
import { useNavigate } from "react-router";
import { FaGraduationCap, FaEdit, FaTrash, FaPlus, FaArrowLeft } from "react-icons/fa";

const LevelPage = () => {
    const [levels, setLevels] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        description: ""
    });
    const [editingId, setEditingId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchLevels();
    }, []);

    const fetchLevels = async () => {
        setIsLoading(true);
        try {
            const res = await authApis().get(endpoints["levels"]);
            setLevels(res.data);
        } catch (err) {
            console.error("Failed to fetch levels:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await authApis().put(endpoints.updateLevel(editingId), formData);
                alert("Cập nhật trình độ thành công!");
            } else {
                await authApis().post(endpoints["createLevel"], formData);
                alert("Thêm trình độ thành công!");
            }
            setFormData({ name: "", description: "" });
            setEditingId(null);
            setShowForm(false);
            fetchLevels();
        } catch (err) {
            alert(editingId ? "Cập nhật thất bại!" : "Thêm thất bại!");
            console.error(err);
        }
    };

    const handleEdit = (level) => {
        setFormData({
            name: level.name,
            description: level.description || ""
        });
        setEditingId(level.levelId);
        setShowForm(true);
    };

    const handleDelete = async (levelId) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa trình độ này?")) return;
        try {
            await authApis().delete(endpoints.deleteLevel(levelId));
            alert("Xóa trình độ thành công!");
            setLevels(levels.filter(l => l.levelId !== levelId));
        } catch (err) {
            alert("Xóa trình độ thất bại!");
            console.error(err);
        }
    };

    const handleCancel = () => {
        setFormData({ name: "", description: "" });
        setEditingId(null);
        setShowForm(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-100 p-6">
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
                            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                                <FaGraduationCap className="text-white text-3xl" />
                            </div>
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-2 border-white animate-pulse-slow"></div>
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold gradient-text">Quản lý trình độ</h1>
                            <p className="text-gray-600 mt-1">Tổng cộng {levels.length} trình độ</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowForm(true)}
                        className="group relative bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 animate-slide-in-right"
                    >
                        <span className="flex items-center gap-2 relative z-10">
                            <FaPlus className="text-xl animate-pulse-slow" />
                            Thêm trình độ
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-green-700 to-emerald-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </button>
                </div>

                {/* Form */}
                {showForm && (
                    <div className="bg-white rounded-xl p-6 shadow-lg mb-8 animate-fade-in-up">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">
                            {editingId ? "Cập nhật trình độ" : "Thêm trình độ mới"}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tên trình độ *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                                    placeholder="Nhập tên trình độ..."
                                    required
                                    maxLength={100}
                                />
                                <p className="text-xs text-gray-500 mt-1">Tối đa 100 ký tự</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Mô tả
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                                    placeholder="Nhập mô tả trình độ..."
                                    rows="3"
                                />
                            </div>
                            <div className="flex gap-4">
                                <button
                                    type="submit"
                                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
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
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                    </div>
                )}

                {/* Levels Grid */}
                {!isLoading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {levels.map((level, index) => (
                            <div 
                                key={level.levelId} 
                                className="group bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105 border border-gray-100 animate-fade-in-up hover-lift"
                                style={{ animationDelay: `${index * 150}ms` }}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
                                            <FaGraduationCap className="text-white text-xl" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{level.name}</h3>
                                            <p className="text-sm text-gray-500">ID: {level.levelId}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(level)}
                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                                            title="Sửa"
                                        >
                                            <FaEdit className="text-sm" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(level.levelId)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                                            title="Xóa"
                                        >
                                            <FaTrash className="text-sm" />
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="space-y-3">
                                    {level.description && (
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                                            {level.description}
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between">
                                        <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                            Trình độ
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

export default LevelPage;
