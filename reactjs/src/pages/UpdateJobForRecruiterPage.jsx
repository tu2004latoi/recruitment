import React, { useEffect, useState } from "react";
import { authApis, endpoints } from "../configs/Apis";
import { useNavigate, useParams } from "react-router";
import { FaBriefcase, FaArrowLeft, FaSave, FaTimes } from "react-icons/fa";

const UpdateJobForRecruiterPage = () => {
    const { jobId } = useParams();
    const [formData, setFormData] = useState({
        jobId: jobId,
        title: "",
        description: "",
        locationId: "",
        salary: "",
        quantity: 1,
        expiredAt: "",
        isActive: true,
        isFeatured: false,
        levelId: "",
        jobTypeId: "",
        industryId: ""
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [levels, setLevels] = useState([]);
    const [jobTypes, setJobTypes] = useState([]);
    const [industries, setIndustries] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, [jobId]);

    const fetchData = async () => {
        setIsFetching(true);
        try {
            const userRes = await authApis().get(endpoints["currentUser"]);
            const user = userRes.data;
            setCurrentUser(user);
            
            // Sử dụng API getJobDetailsByRecruiter
            const jobRes = await authApis().get(endpoints.getJobDetailsByRecruiter(user.userId, jobId));
            const job = jobRes.data;
            
            // Kiểm tra xem job có thuộc về current user không
            if (job.user?.userId !== user.userId) {
                alert("Bạn không có quyền chỉnh sửa công việc này!");
                navigate("/recruiter");
                return;
            }
            
            // Format date for datetime-local input
            const formatDateForInput = (dateString) => {
                if (!dateString) return "";
                const date = new Date(dateString);
                return date.toISOString().slice(0, 16);
            };

            setFormData({
                jobId: jobId,
                title: job.title || "",
                description: job.description || "",
                locationId: job.location.locationId || "",
                salary: job.salary ? job.salary.toString() : "",
                quantity: job.quantity || 1,
                expiredAt: formatDateForInput(job.expiredAt),
                isActive: job.isActive !== undefined ? job.isActive : true,
                isFeatured: job.isFeatured || false,
                levelId: job.level?.levelId ? job.level.levelId.toString() : "",
                jobTypeId: job.jobType?.jobTypeId ? job.jobType.jobTypeId.toString() : "",
                industryId: job.industry?.industryId ? job.industry.industryId.toString() : ""
            });

            // Load dropdown data
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
            alert("Không thể tải thông tin công việc!");
            navigate("/recruiter");
        } finally {
            setIsFetching(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        
        try {
            const jobData = {
                ...formData,
                locationId: formData.locationId || null,
                userId: currentUser.userId, // Đảm bảo userId vẫn là current user
                salary: formData.salary ? parseInt(formData.salary) : null,
                quantity: parseInt(formData.quantity),
                levelId: formData.levelId ? parseInt(formData.levelId) : null,
                jobTypeId: formData.jobTypeId ? parseInt(formData.jobTypeId) : null,
                industryId: formData.industryId ? parseInt(formData.industryId) : null,
                expiredAt: formData.expiredAt ? new Date(formData.expiredAt).toISOString() : null
            };

            console.log("Submitting job data:", jobData);

            await authApis().patch(endpoints.updateJob(jobId), jobData);
            alert("Cập nhật tin tuyển dụng thành công!");
            navigate("/recruiter");
        } catch (err) {
            alert("Cập nhật tin tuyển dụng thất bại!");
            console.error(err);
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

    if (isFetching) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                </div>
            </div>
        );
    }

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
                            <h1 className="text-4xl font-bold gradient-text">Cập nhật tin tuyển dụng</h1>
                            <p className="text-gray-600 mt-1">Chỉnh sửa thông tin tin tuyển dụng</p>
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
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="isFeatured"
                                    checked={formData.isFeatured}
                                    onChange={handleChange}
                                    className="w-4 h-4 text-yellow-600 bg-gray-100 border-gray-300 rounded focus:ring-yellow-500 focus:ring-2"
                                />
                                <label className="ml-2 text-sm font-medium text-gray-700">
                                    Nổi bật
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
                                            Cập nhật tin với tư cách: {currentUser.firstName} {currentUser.lastName}
                                        </p>
                                        <p className="text-xs text-blue-700">{currentUser.email}</p>
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
                                Cập nhật tin tuyển dụng
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

export default UpdateJobForRecruiterPage; 