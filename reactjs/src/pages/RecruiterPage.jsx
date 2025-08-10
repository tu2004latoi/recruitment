import React, { useEffect, useState } from "react";
import { authApis, endpoints } from "../configs/Apis";
import { useNavigate } from "react-router";
import { FaBriefcase, FaEdit, FaTrash, FaPlus, FaEye, FaUsers, FaMapMarkerAlt, FaMoneyBillWave, FaCalendarAlt, FaUserCircle, FaEnvelope, FaToggleOn, FaToggleOff } from "react-icons/fa";

const RecruiterPage = () => {
    const [jobs, setJobs] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const userRes = await authApis().get(endpoints["currentUser"]);
            setCurrentUser(userRes.data);
            
            // Get jobs for current recruiter
            const jobsRes = await authApis().get(endpoints.getJobsByRecruiter(userRes.data.userId));
            setJobs(jobsRes.data);
        } catch (err) {
            console.error("Failed to fetch data:", err);
            // Fallback to get all jobs and filter
            try {
                const userRes = await authApis().get(endpoints["currentUser"]);
                const allJobsRes = await authApis().get(endpoints["jobs"]);
                const recruiterJobs = allJobsRes.data.filter(job => 
                    job.recruiter?.userId === userRes.data.userId
                );
                console.log("Fallback - Recruiter Jobs:", recruiterJobs);
                setJobs(recruiterJobs);
            } catch (fallbackErr) {
                console.error("Fallback also failed:", fallbackErr);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (jobId) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa công việc này?")) return;
        try {
            await authApis().delete(endpoints.deleteJob(jobId));
            alert("Xóa công việc thành công!");
            setJobs(jobs.filter(j => j.jobId !== jobId));
        } catch (err) {
            alert("Xóa công việc thất bại!");
            console.error(err);
        }
    };

    const handleToggleJobStatus = async (jobId, currentStatus) => {
        try {
            const activationDTO = {
                isActive: !currentStatus
            };
            await authApis().patch(endpoints.activationJob(jobId), activationDTO);
            alert(`Đã ${currentStatus ? 'tắt' : 'bật'} trạng thái công việc!`);
            fetchData();
        } catch (err) {
            console.error("Lỗi khi cập nhật trạng thái job:", err);
            alert("Có lỗi xảy ra khi cập nhật trạng thái công việc!");
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    const formatSalary = (salary) => {
        if (!salary) return "Thỏa thuận";
        return new Intl.NumberFormat('vi-VN').format(salary) + " VNĐ";
    };

    const getStatusBadge = (isActive, isFeatured) => {
        if (!isActive) {
            return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Không hoạt động</span>;
        }
        if (isFeatured) {
            return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Nổi bật</span>;
        }
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Hoạt động</span>;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8 animate-fade-in-up">
                    <div className="flex items-center gap-4">
                        <div className="relative animate-pulse-slow">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                                <FaUserCircle className="text-white text-3xl" />
                            </div>
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-2 border-white animate-pulse-slow"></div>
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold gradient-text">Bảng điều khiển Recruiter</h1>
                            <p className="text-gray-600 mt-1">
                                Xin chào, {currentUser?.firstName} {currentUser?.lastName}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate("/recruiter/jobs/add")}
                        className="group relative bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 animate-slide-in-right"
                    >
                        <span className="flex items-center gap-2 relative z-10">
                            <FaPlus className="text-xl animate-pulse-slow" />
                            Đăng tin tuyển dụng
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </button>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div 
                        onClick={() => navigate("/recruiter/jobs/add")}
                        className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer animate-fade-in-up"
                        style={{ animationDelay: '100ms' }}
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                                <FaPlus className="text-2xl" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">Đăng tin mới</h3>
                                <p className="text-blue-100 text-sm">Tạo tin tuyển dụng mới</p>
                            </div>
                        </div>
                    </div>
                    
                    <div 
                        onClick={() => navigate("/recruiter")}
                        className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer animate-fade-in-up"
                        style={{ animationDelay: '200ms' }}
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                                <FaBriefcase className="text-2xl" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">Quản lý tin</h3>
                                <p className="text-green-100 text-sm">Xem và chỉnh sửa tin</p>
                            </div>
                        </div>
                    </div>
                    
                    <div 
                        onClick={() => navigate("/recruiter/applications")}
                        className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer animate-fade-in-up"
                        style={{ animationDelay: '300ms' }}
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                                <FaEnvelope className="text-2xl" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">Đơn ứng tuyển</h3>
                                <p className="text-purple-100 text-sm">Quản lý đơn ứng tuyển</p>
                            </div>
                        </div>
                    </div>
                    
                    <div 
                        onClick={() => navigate("/admin/job-types")}
                        className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer animate-fade-in-up"
                        style={{ animationDelay: '400ms' }}
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                                <FaBriefcase className="text-2xl" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">Loại công việc</h3>
                                <p className="text-orange-100 text-sm">Xem danh sách loại</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* User Info Card */}
                {currentUser && (
                    <div className="bg-white rounded-xl p-6 shadow-lg mb-8 animate-fade-in-up">
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                                <FaUserCircle className="text-white text-3xl" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    {currentUser.firstName} {currentUser.lastName}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                                    <div>
                                        <span className="font-medium">Email:</span> {currentUser.email}
                                    </div>
                                    <div>
                                        <span className="font-medium">Số điện thoại:</span> {currentUser.phone || "N/A"}
                                    </div>
                                    <div>
                                        <span className="font-medium">Vai trò:</span> 
                                        <span className="ml-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                            {currentUser.role}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm text-gray-500">User ID</div>
                                <div className="text-lg font-bold text-gray-900">#{currentUser.userId}</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 animate-fade-in-up hover-lift">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Tổng tin tuyển</p>
                                <p className="text-2xl font-bold text-gray-900">{jobs.length}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <FaBriefcase className="text-blue-600 text-xl" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 animate-fade-in-up hover-lift" style={{ animationDelay: '100ms' }}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Đang hoạt động</p>
                                <p className="text-2xl font-bold text-green-600">{jobs.filter(j => j.isActive).length}</p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <FaEye className="text-green-600 text-xl" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 animate-fade-in-up hover-lift" style={{ animationDelay: '200ms' }}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Nổi bật</p>
                                <p className="text-2xl font-bold text-yellow-600">{jobs.filter(j => j.isFeatured).length}</p>
                            </div>
                            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                                <FaBriefcase className="text-yellow-600 text-xl" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 animate-fade-in-up hover-lift" style={{ animationDelay: '300ms' }}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Tổng ứng tuyển</p>
                                <p className="text-2xl font-bold text-purple-600">{jobs.reduce((sum, job) => sum + (job.applicationCount || 0), 0)}</p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <FaUsers className="text-purple-600 text-xl" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Additional Features */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white rounded-xl p-6 shadow-lg animate-fade-in-up">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <FaBriefcase className="text-blue-600" />
                            Quản lý tin tuyển dụng
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="text-sm text-gray-700">Tổng số tin đã đăng</span>
                                <span className="font-semibold text-blue-600">{jobs.length}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="text-sm text-gray-700">Tin đang hoạt động</span>
                                <span className="font-semibold text-green-600">{jobs.filter(j => j.isActive).length}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="text-sm text-gray-700">Tin nổi bật</span>
                                <span className="font-semibold text-yellow-600">{jobs.filter(j => j.isFeatured).length}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-xl p-6 shadow-lg animate-fade-in-up">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <FaUsers className="text-purple-600" />
                            Thống kê ứng tuyển
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="text-sm text-gray-700">Tổng lượt ứng tuyển</span>
                                <span className="font-semibold text-purple-600">{jobs.reduce((sum, job) => sum + (job.applicationCount || 0), 0)}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="text-sm text-gray-700">Tổng lượt xem</span>
                                <span className="font-semibold text-blue-600">{jobs.reduce((sum, job) => sum + (job.viewsCount || 0), 0)}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="text-sm text-gray-700">Tổng số lượng tuyển</span>
                                <span className="font-semibold text-green-600">{jobs.reduce((sum, job) => sum + (job.quantity || 0), 0)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                )}

                {/* Jobs Grid */}
                {!isLoading && (
                    <>
                        {jobs.length === 0 ? (
                            <div className="bg-white rounded-xl p-12 text-center shadow-sm animate-fade-in-up">
                                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <FaBriefcase className="text-blue-600 text-3xl" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">Chưa có tin tuyển dụng nào</h3>
                                <p className="text-gray-600 mb-8">Bắt đầu đăng tin tuyển dụng đầu tiên của bạn</p>
                                <button
                                    onClick={() => navigate("/recruiter/jobs/add")}
                                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 hover:scale-105"
                                >
                                    Đăng tin tuyển dụng
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {jobs.map((job, index) => (
                                    <div 
                                        key={job.jobId} 
                                        className="group bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105 border border-gray-100 animate-fade-in-up hover-lift"
                                        style={{ animationDelay: `${index * 150}ms` }}
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center">
                                                        <FaBriefcase className="text-white text-xl" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-gray-900 text-lg">{job.title}</h3>
                                                        <p className="text-sm text-gray-500">ID: {job.jobId}</p>
                                                    </div>
                                                </div>
                                                
                                                <div className="space-y-2 mb-4">
                                                    {job.description && (
                                                        <p className="text-sm text-gray-600 line-clamp-2">{job.description}</p>
                                                    )}
                                                    
                                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                                        {job.location && (
                                                            <div className="flex items-center gap-1">
                                                                <FaMapMarkerAlt className="text-blue-500" />
                                                                <span>
                                                                    {typeof job.location === 'object' 
                                                                        ? `${job.location.province}, ${job.location.district}` 
                                                                        : job.location}
                                                                </span>
                                                            </div>
                                                        )}
                                                        {job.salary && (
                                                            <div className="flex items-center gap-1">
                                                                <FaMoneyBillWave className="text-green-500" />
                                                                <span>{formatSalary(job.salary)}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                                        <div className="flex items-center gap-1">
                                                            <FaUsers className="text-purple-500" />
                                                            <span>Số lượng: {job.quantity}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <FaEye className="text-blue-500" />
                                                            <span>Lượt xem: {job.viewsCount || 0}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <FaUsers className="text-green-500" />
                                                            <span>Ứng tuyển: {job.applicationCount || 0}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex gap-2 ml-4">
                                                <button
                                                    onClick={() => navigate(`/recruiter/jobs/${job.jobId}/update`)}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                                                    title="Sửa"
                                                >
                                                    <FaEdit className="text-sm" />
                                                </button>
                                                <button
                                                    onClick={() => handleToggleJobStatus(job.jobId, job.isActive)}
                                                    className={`p-2 rounded-lg transition-all duration-200 ${
                                                        job.isActive 
                                                            ? 'text-gray-400 hover:text-red-600 hover:bg-red-50' 
                                                            : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                                                    }`}
                                                    title={job.isActive ? "Tắt hoạt động" : "Bật hoạt động"}
                                                >
                                                    {job.isActive ? <FaToggleOff className="text-sm" /> : <FaToggleOn className="text-sm" />}
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(job.jobId)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                                                    title="Xóa"
                                                >
                                                    <FaTrash className="text-sm" />
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                            <div className="flex items-center gap-2">
                                                {getStatusBadge(job.isActive, job.isFeatured)}
                                                {job.level && (
                                                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                                        {typeof job.level === 'object' ? job.level.name : job.level}
                                                    </span>
                                                )}
                                                {job.jobType && (
                                                    <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                                                        {typeof job.jobType === 'object' ? job.jobType.name : job.jobType}
                                                    </span>
                                                )}
                                                {job.industry && (
                                                    <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                                                        {typeof job.industry === 'object' ? job.industry.name : job.industry}
                                                    </span>
                                                )}
                                            </div>
                                            
                                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                                <FaCalendarAlt />
                                                <span>Hết hạn: {formatDate(job.expiredAt)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* Quick Actions Footer */}
                <div className="mt-8 bg-white rounded-xl p-6 shadow-lg animate-fade-in-up">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Hành động nhanh</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button
                            onClick={() => navigate("/recruiter/jobs/add")}
                            className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all duration-200 group"
                        >
                            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                <FaPlus className="text-white text-sm" />
                            </div>
                            <div className="text-left">
                                <div className="font-medium text-gray-900">Đăng tin mới</div>
                                <div className="text-sm text-gray-600">Tạo tin tuyển dụng</div>
                            </div>
                        </button>
                        
                        <button
                            onClick={() => navigate("/recruiter/applications")}
                            className="flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-all duration-200 group"
                        >
                            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                <FaEnvelope className="text-white text-sm" />
                            </div>
                            <div className="text-left">
                                <div className="font-medium text-gray-900">Quản lý đơn ứng tuyển</div>
                                <div className="text-sm text-gray-600">Xem và xử lý đơn</div>
                            </div>
                        </button>
                        
                        <button
                            onClick={() => navigate("/admin/job-types")}
                            className="flex items-center gap-3 p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-all duration-200 group"
                        >
                            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                <FaBriefcase className="text-white text-sm" />
                            </div>
                            <div className="text-left">
                                <div className="font-medium text-gray-900">Xem loại công việc</div>
                                <div className="text-sm text-gray-600">Danh sách loại</div>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecruiterPage;
