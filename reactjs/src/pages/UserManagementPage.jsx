import React, { useEffect, useState } from "react";
import { authApis, endpoints } from "../configs/Apis";
import { useNavigate } from "react-router";
import { FaEdit, FaTrash, FaUserCircle, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const UserManagementPage = () => {
    const [users, setUsers] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                let res = await authApis().get(endpoints["users"]);
                setUsers(res.data);
            } catch (err) {
                console.error("Failed to fetch users:", err);
            }
        };

        fetchUsers();
    }, []);
    
    const handleAddUser = () => {
        navigate("/admin/users/add");
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa user này?")) return;
        try {
            await authApis().delete(endpoints.deleteUser(userId));
            alert("Xóa user thành công!");
            setUsers(users.filter(u => u.userId !== userId));
        } catch (err) {
            alert("Xóa user thất bại!");
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
            {/* Header */}
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8 animate-fade-in-up">
                    <div className="flex items-center gap-4">
                        <div className="relative animate-pulse-slow">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                                <FaUserCircle className="text-white text-3xl" />
                            </div>
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-2 border-white animate-pulse-slow"></div>
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold gradient-text">Quản lý người dùng</h1>
                            <p className="text-gray-600 mt-1">Tổng cộng {users.length} người dùng</p>
                        </div>
                    </div>
                    <button
                        onClick={handleAddUser}
                        className="group relative bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 animate-slide-in-right"
                    >
                        <span className="flex items-center gap-2 relative z-10">
                            <span className="text-xl animate-pulse-slow">+</span>
                            Thêm người dùng
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 animate-fade-in-up hover-lift">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Tổng người dùng</p>
                                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <FaUserCircle className="text-blue-600 text-xl" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 animate-fade-in-up hover-lift" style={{ animationDelay: '100ms' }}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Admin</p>
                                <p className="text-2xl font-bold text-yellow-600">{users.filter(u => u.role === 'ADMIN').length}</p>
                            </div>
                            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                                <FaUserCircle className="text-yellow-600 text-xl" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 animate-fade-in-up hover-lift" style={{ animationDelay: '200ms' }}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Recruiter</p>
                                <p className="text-2xl font-bold text-green-600">{users.filter(u => u.role === 'RECRUITER').length}</p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <FaUserCircle className="text-green-600 text-xl" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 animate-fade-in-up hover-lift" style={{ animationDelay: '300ms' }}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Applicant</p>
                                <p className="text-2xl font-bold text-indigo-600">{users.filter(u => u.role === 'APPLICANT').length}</p>
                            </div>
                            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                                <FaUserCircle className="text-indigo-600 text-xl" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Users Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {users.map((user, index) => (
                        <div 
                            key={user.userId} 
                            className="group bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105 border border-gray-100 animate-fade-in-up hover-lift"
                            style={{ animationDelay: `${index * 150}ms` }}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        {user.avatar ? (
                                            <img 
                                                src={user.avatar} 
                                                alt="avatar" 
                                                className="w-12 h-12 rounded-full object-cover border-2 border-gray-200" 
                                            />
                                        ) : (
                                            <div className="w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
                                                <FaUserCircle className="text-gray-500 text-xl" />
                                            </div>
                                        )}
                                        {user.isActive && (
                                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{user.firstName} {user.lastName}</h3>
                                        <p className="text-sm text-gray-500">@{user.username}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => navigate(`/admin/users/${user.userId}/update`)}
                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                                        title="Sửa"
                                    >
                                        <FaEdit className="text-sm" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteUser(user.userId)}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                                        title="Xóa"
                                    >
                                        <FaTrash className="text-sm" />
                                    </button>
                                </div>
                            </div>
                            
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                                    {user.email}
                                </div>
                                {user.phone && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                                        {user.phone}
                                    </div>
                                )}
                                <div className="flex items-center justify-between">
                                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                                        user.role === "ADMIN" ? "bg-yellow-100 text-yellow-800" :
                                        user.role === "RECRUITER" ? "bg-green-100 text-green-800" :
                                        user.role === "APPLICANT" ? "bg-blue-100 text-blue-800" :
                                        "bg-gray-100 text-gray-800"
                                    }`}>
                                        {user.role}
                                    </span>
                                    <span className={`flex items-center gap-1 text-xs ${
                                        user.isActive ? "text-green-600" : "text-red-600"
                                    }`}>
                                        {user.isActive ? <FaCheckCircle /> : <FaTimesCircle />}
                                        {user.isActive ? "Hoạt động" : "Bị khóa"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default UserManagementPage;
