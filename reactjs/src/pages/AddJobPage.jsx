import React, { useEffect, useState } from "react";
import { authApis, endpoints } from "../configs/Apis";
import { useNavigate } from "react-router";
import { FaBriefcase, FaArrowLeft, FaSave, FaTimes } from "react-icons/fa";
import LocationSelector from '../components/LocationSelector';

const AddJobPage = () => {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        locationId: null,
        salary: "",
        quantity: 1,
        expiredAt: "",
        isActive: true,
        isFeatured: false,
        status: "PENDING",
        userId: "",
        moderatorId: "",
        levelId: "",
        jobTypeId: "",
        industryId: ""
    });
    const [isLoading, setIsLoading] = useState(false);
    const [recruiters, setRecruiters] = useState([]);
    const [moderators, setModerators] = useState([]);
    const [levels, setLevels] = useState([]);
    const [jobTypes, setJobTypes] = useState([]);
    const [industries, setIndustries] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [usersRes, levelsRes, jobTypesRes, industriesRes] = await Promise.all([
                authApis().get(endpoints["users"]),
                authApis().get(endpoints["levels"]),
                authApis().get(endpoints["jobTypes"]),
                authApis().get(endpoints["jobIndustries"])
            ]);
            
            // Filter recruiters and moderators from users
            const recruiterUsers = usersRes.data.filter(user => user.role === 'RECRUITER');
            const moderatorUsers = usersRes.data.filter(user => user.role === 'MODERATOR');
            setRecruiters(recruiterUsers);
            setModerators(moderatorUsers);
            setLevels(levelsRes.data);
            setJobTypes(jobTypesRes.data);
            setIndustries(industriesRes.data);
        } catch (err) {
            console.error("Failed to fetch data:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        
        try {
            const jobData = {
                ...formData,
                salary: formData.salary ? parseInt(formData.salary) : null,
                quantity: parseInt(formData.quantity),
                userId: parseInt(formData.userId),
                levelId: formData.levelId ? parseInt(formData.levelId) : null,
                jobTypeId: formData.jobTypeId ? parseInt(formData.jobTypeId) : null,
                industryId: formData.industryId ? parseInt(formData.industryId) : null,
                expiredAt: formData.expiredAt ? new Date(formData.expiredAt).toISOString() : null
            };

            // Chỉ thêm moderatorId nếu có giá trị hợp lệ
            if (formData.moderatorId && formData.moderatorId.trim() !== "") {
                jobData.moderatorId = parseInt(formData.moderatorId);
            }

            console.log("Job data being sent:", jobData);
            await authApis().post(endpoints["createJob"], jobData);
            alert("Thêm công việc thành công!");
            navigate("/admin/jobs");
        } catch (err) {
            alert("Thêm công việc thất bại!");
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

    const handleLocationChange = (locationId) => {
        setFormData(prev => ({
            ...prev,
            locationId
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
                            <h1 className="text-4xl font-bold gradient-text">Thêm công việc mới</h1>
                            <p className="text-gray-600 mt-1">Tạo công việc tuyển dụng mới</p>
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
                                <LocationSelector
                                    selectedLocationId={formData.locationId}
                                    onLocationChange={handleLocationChange}
                                    showCreateForm={true}
                                    className="w-full"
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nhà tuyển dụng *
                                </label>
                                <select
                                    name="userId"
                                    value={formData.userId}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    required
                                >
                                    <option value="">Chọn nhà tuyển dụng</option>
                                    {recruiters.map(recruiter => (
                                        <option key={recruiter.userId} value={recruiter.userId}>
                                            {recruiter.firstName} {recruiter.lastName} - {recruiter.email}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Moderator
                                </label>
                                <select
                                    name="moderatorId"
                                    value={formData.moderatorId}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                >
                                    <option value="">Chọn moderator</option>
                                    {moderators.map(moderator => (
                                        <option key={moderator.userId} value={moderator.userId}>
                                            {moderator.firstName} {moderator.lastName} - {moderator.email}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Trạng thái *
                                </label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    required
                                >
                                    <option value="PENDING">Chờ duyệt</option>
                                    <option value="APPROVED">Đã duyệt</option>
                                    <option value="REJECTED">Từ chối</option>
                                </select>
                            </div>
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
                                Thêm công việc
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

export default AddJobPage;
