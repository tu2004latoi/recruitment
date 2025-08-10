import React, { useEffect, useState, useContext } from "react";
import { authApis, endpoints } from "../configs/Apis";
import { useNavigate } from "react-router";
import { FaBriefcase, FaArrowLeft, FaSave, FaTimes } from "react-icons/fa";
import { MyUserContext } from "../configs/MyContexts";

const AddJobForRecruiterPage = () => {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        location: "",
        salary: "",
        quantity: 1,
        expiredAt: "",
        isActive: true,
        levelId: "",
        jobTypeId: "",
        industryId: ""
    });
    const [isLoading, setIsLoading] = useState(false);
    const [levels, setLevels] = useState([]);
    const [jobTypes, setJobTypes] = useState([]);
    const [industries, setIndustries] = useState([]);
    const [recruiterLocationId, setRecruiterLocationId] = useState(null);
    const navigate = useNavigate();
    const currentUser = useContext(MyUserContext);

    useEffect(() => {
        fetchData();
        fetchRecruiterLocation();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [levelsRes, jobTypesRes, industriesRes] = await Promise.all([
                authApis().get(endpoints["levels"]),
                authApis().get(endpoints["jobTypes"]),
                authApis().get(endpoints["jobIndustries"])
            ]);
            
            setLevels(levelsRes.data);
            setJobTypes(jobTypesRes.data);
            setIndustries(industriesRes.data);
        } catch (err) {
            console.error("Failed to fetch data:", err);
        } finally {
            setIsLoading(false);
        }
    };

    // Lấy locationId của recruiter hiện tại
    const fetchRecruiterLocation = async () => {
        if (!currentUser || !currentUser.userId) return;
        
        try {
            // Lấy thông tin recruiter để có locationId
            const recruiterResponse = await authApis().get(endpoints.recruiterDetail(currentUser.userId));
            console.log(recruiterResponse.data);
            if (recruiterResponse.data && recruiterResponse.data.location.locationId) {
                setRecruiterLocationId(recruiterResponse.data.location.locationId);
                console.log("Recruiter locationId:", recruiterResponse.data.location.locationId);
            }
        } catch (error) {
           console.error("Error fetching recruiter location:", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Kiểm tra currentUser
        if (!currentUser || !currentUser.userId) {
            alert("Không thể lấy thông tin người dùng. Vui lòng thử lại!");
            return;
        }
        
        setIsLoading(true);
        
        try {
            const jobData = {
                ...formData,
                userId: parseInt(currentUser.userId),
                locationId: recruiterLocationId, // Sử dụng locationId của recruiter hiện tại
                salary: formData.salary ? parseInt(formData.salary) : null,
                quantity: parseInt(formData.quantity),
                levelId: formData.levelId ? parseInt(formData.levelId) : null,
                jobTypeId: formData.jobTypeId ? parseInt(formData.jobTypeId) : null,
                industryId: formData.industryId ? parseInt(formData.industryId) : null,
                expiredAt: formData.expiredAt ? new Date(formData.expiredAt).toISOString() : null
            };

            console.log("Job Data:", jobData);
            console.log("Current User:", currentUser);
            console.log("Recruiter ID being sent:", jobData.userId);
            console.log("Recruiter Location ID being sent:", jobData.locationId);

            // Log the exact request payload
            console.log("Request payload:", JSON.stringify(jobData, null, 2));

            await authApis().post(endpoints["createJob"], jobData);
            alert("Đăng tin tuyển dụng thành công!");
            navigate("/recruiter");
        } catch (err) {
            console.error("Error creating job:", err);
            if (err.response?.data?.message) {
                alert(`Đăng tin tuyển dụng thất bại: ${err.response.data.message}`);
            } else {
                alert("Đăng tin tuyển dụng thất bại!");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
            <div className="max-w-4xl mx-auto">
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
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                                <FaBriefcase className="text-white text-3xl" />
                            </div>
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-2 border-white animate-pulse-slow"></div>
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold gradient-text">Đăng tin tuyển dụng</h1>
                            <p className="text-gray-600 mt-1">Tạo tin tuyển dụng mới</p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div className="bg-white rounded-xl p-8 shadow-lg animate-fade-in-up">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tiêu đề công việc *
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    placeholder="Nhập tiêu đề công việc..."
                                    required
                                    maxLength={255}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Địa điểm
                                </label>
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    placeholder="Nhập địa điểm..."
                                    maxLength={255}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Mô tả công việc
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                placeholder="Nhập mô tả chi tiết công việc..."
                                rows="4"
                            />
                        </div>

                        {/* Salary and Quantity */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Mức lương (VNĐ)
                                </label>
                                <input
                                    type="number"
                                    name="salary"
                                    value={formData.salary}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    placeholder="Nhập mức lương..."
                                    min="0"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Số lượng tuyển *
                                </label>
                                <input
                                    type="number"
                                    name="quantity"
                                    value={formData.quantity}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    placeholder="Số lượng..."
                                    required
                                    min="1"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Ngày hết hạn
                                </label>
                                <input
                                    type="datetime-local"
                                    name="expiredAt"
                                    value={formData.expiredAt}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                />
                            </div>
                        </div>

                        {/* Relationships */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Trình độ
                                </label>
                                <select
                                    name="levelId"
                                    value={formData.levelId}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                >
                                    <option value="">Chọn trình độ</option>
                                    {levels.map(level => (
                                        <option key={level.levelId} value={level.levelId}>
                                            {level.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Loại công việc
                                </label>
                                <select
                                    name="jobTypeId"
                                    value={formData.jobTypeId}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                >
                                    <option value="">Chọn loại công việc</option>
                                    {jobTypes.map(jobType => (
                                        <option key={jobType.jobTypeId} value={jobType.jobTypeId}>
                                            {jobType.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Ngành nghề
                                </label>
                                <select
                                    name="industryId"
                                    value={formData.industryId}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                >
                                    <option value="">Chọn ngành nghề</option>
                                    {industries.map(industry => (
                                        <option key={industry.industryId} value={industry.industryId}>
                                            {industry.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Status */}
                        <div className="flex items-center gap-6">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="isActive"
                                    checked={formData.isActive}
                                    onChange={handleChange}
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                />
                                <label className="ml-2 text-sm font-medium text-gray-700">
                                    Hoạt động
                                </label>
                            </div>
                        </div>

                        {/* Recruiter Info */}
                        {currentUser && (
                            <div className="bg-blue-50 rounded-lg p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                                        <FaBriefcase className="text-white text-sm" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-blue-900">
                                            Đăng tin với tư cách: {currentUser.firstName} {currentUser.lastName}
                                        </p>
                                        <p className="text-xs text-blue-700">{currentUser.email}</p>
                                        <p className="text-xs text-blue-600">User ID: {currentUser.userId}</p>
                                        {recruiterLocationId && (
                                            <p className="text-xs text-blue-600">Location ID: {recruiterLocationId}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Buttons */}
                        <div className="flex gap-4 pt-6">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                ) : (
                                    <FaSave className="text-lg" />
                                )}
                                Đăng tin tuyển dụng
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-all duration-200 flex items-center justify-center gap-2"
                            >
                                <FaTimes className="text-lg" />
                                Hủy
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddJobForRecruiterPage; 