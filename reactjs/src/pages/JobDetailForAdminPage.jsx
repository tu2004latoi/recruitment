import React, { useEffect, useState } from "react";
import { authApis, endpoints } from "../configs/Apis";
import { useNavigate, useParams } from "react-router";
import { 
    FaBriefcase, 
    FaArrowLeft, 
    FaMapMarkerAlt, 
    FaMoneyBillWave, 
    FaCalendarAlt, 
    FaUsers, 
    FaBuilding, 
    FaClock, 
    FaStar,
    FaCheck,
    FaTimes,
    FaEye,
    FaEdit,
    FaTrash,
    FaToggleOn,
    FaToggleOff,
    FaUserShield
} from "react-icons/fa";

const JobDetailForAdminPage = () => {
    const { jobId } = useParams();
    const [job, setJob] = useState(null);
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCurrentUser();
    }, []);

    useEffect(() => {
        if (user) {
            // Kiểm tra quyền admin hoặc moderator
            if (user.role !== "ADMIN" && user.role !== "MODERATOR") {
                alert("Bạn không có quyền truy cập trang này!");
                navigate("/");
                return;
            }
            fetchJobDetail();
        }
    }, [user]);

    const fetchCurrentUser = async () => {
        try {
            const response = await authApis().get(endpoints["currentUser"]);
            setUser(response.data);
        } catch (err) {
            console.error("Failed to fetch current user:", err);
            alert("Không thể tải thông tin người dùng!");
            navigate("/login");
        }
    };

    const fetchJobDetail = async () => {
        setIsLoading(true);
        try {
            const response = await authApis().get(endpoints.jobDetail(jobId));
            setJob(response.data);
        } catch (err) {
            console.error("Failed to fetch job detail:", err);
            alert("Không thể tải thông tin công việc!");
            navigate("/admin/jobs");
        } finally {
            setIsLoading(false);
        }
    };

    const handleApproveJob = async () => {
        setIsUpdating(true);
        try {
            const moderatorJobDTO = {
                jobId: jobId,
                moderatorId: user.userId
            };
            await authApis().patch(endpoints.approveJob(jobId), moderatorJobDTO);
            alert("Đã duyệt công việc thành công!");
            navigate("/admin/jobs");
        } catch (err) {
            alert("Không thể duyệt công việc!");
            console.error(err);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleRejectJob = async () => {
        setIsUpdating(true);
        try {
            const moderatorJobDTO = {
                jobId: jobId,
                moderatorId: user.userId
            };
            await authApis().patch(endpoints.rejectJob(jobId), moderatorJobDTO);
            alert("Đã từ chối công việc!");
            navigate("/admin/jobs");
        } catch (err) {
            alert("Không thể từ chối công việc!");
            console.error(err);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleToggleJobStatus = async () => {
        setIsUpdating(true);
        try {
            const activationDTO = {
                isActive: !job.isActive
            };
            await authApis().patch(endpoints.activationJob(jobId), activationDTO);
            alert(`Đã ${job.isActive ? 'tắt' : 'bật'} trạng thái công việc!`);
            fetchJobDetail(); // Refresh data
        } catch (err) {
            alert("Cập nhật trạng thái thất bại!");
            console.error(err);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeleteJob = async () => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa công việc này?")) return;
        
        setIsUpdating(true);
        try {
            await authApis().delete(endpoints.deleteJob(jobId));
            alert("Xóa công việc thành công!");
            navigate("/admin/jobs");
        } catch (err) {
            alert("Xóa công việc thất bại!");
            console.error(err);
        } finally {
            setIsUpdating(false);
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

    const getStatusBadge = (isActive) => {
        if (isActive) {
            return (
                <span className="px-3 py-1 text-sm font-medium bg-green-100 text-green-800 rounded-full flex items-center gap-2">
                    <FaCheck className="text-sm" />
                    Hoạt động
                </span>
            );
        } else {
            return (
                <span className="px-3 py-1 text-sm font-medium bg-red-100 text-red-800 rounded-full flex items-center gap-2">
                    <FaTimes className="text-sm" />
                    Không hoạt động
                </span>
            );
        }
    };

    const getApprovalStatusBadge = (status) => {
        switch (status) {
            case "PENDING":
                return (
                    <span className="px-3 py-1 text-sm font-medium bg-yellow-100 text-yellow-800 rounded-full flex items-center gap-2">
                        <FaClock className="text-sm" />
                        Chờ duyệt
                    </span>
                );
            case "APPROVED":
                return (
                    <span className="px-3 py-1 text-sm font-medium bg-green-100 text-green-800 rounded-full flex items-center gap-2">
                        <FaCheck className="text-sm" />
                        Đã duyệt
                    </span>
                );
            case "REJECTED":
                return (
                    <span className="px-3 py-1 text-sm font-medium bg-red-100 text-red-800 rounded-full flex items-center gap-2">
                        <FaTimes className="text-sm" />
                        Từ chối
                    </span>
                );
            default:
                return (
                    <span className="px-3 py-1 text-sm font-medium bg-gray-100 text-gray-800 rounded-full flex items-center gap-2">
                        <FaClock className="text-sm" />
                        Chờ duyệt
                    </span>
                );
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-100 to-blue-300">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-blue-600 font-semibold">Đang tải...</p>
                </div>
            </div>
        );
    }

    if (!job) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-red-100 to-red-300">
                <div className="text-center">
                    <h3 className="text-2xl font-bold text-red-600 mb-4">Không tìm thấy công việc</h3>
                    <button
                        onClick={() => navigate("/admin/jobs")}
                        className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Quay lại
                    </button>
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
                            <h1 className="text-4xl font-bold gradient-text">Chi tiết công việc</h1>
                            <p className="text-gray-600 mt-1">Xem thông tin chi tiết trước khi duyệt</p>
                        </div>
                    </div>
                </div>

                {/* Job Details */}
                <div className="bg-white rounded-xl p-8 shadow-lg animate-fade-in-up">
                    {/* Header với status badges */}
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex-1">
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h2>
                            {job.user && (
                                <p className="text-lg text-gray-600 flex items-center gap-2 mb-4">
                                    <FaBuilding className="text-blue-500" />
                                    Nhà tuyển dụng: {job.user.firstName} {job.user.lastName}
                                </p>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            {job.isFeatured && (
                                <div className="flex items-center gap-1 text-yellow-500">
                                    <FaStar />
                                    <span className="text-sm font-medium">Nổi bật</span>
                                </div>
                            )}
                            {getStatusBadge(job.isActive)}
                            {getApprovalStatusBadge(job.status)}
                        </div>
                    </div>

                    {/* Description */}
                    {job.description && (
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Mô tả công việc</h3>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
                            </div>
                        </div>
                    )}

                    {/* Job Information Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <FaMapMarkerAlt className="text-blue-500 text-lg" />
                                <div>
                                    <p className="text-sm text-gray-500">Địa điểm</p>
                                    <p className="font-medium">
                                        {typeof job.location === 'object' 
                                            ? `${job.location.province}, ${job.location.district}` 
                                            : (job.location || "Không xác định")}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <FaMoneyBillWave className="text-green-500 text-lg" />
                                <div>
                                    <p className="text-sm text-gray-500">Mức lương</p>
                                    <p className="font-medium">{formatSalary(job.salary)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <FaUsers className="text-purple-500 text-lg" />
                                <div>
                                    <p className="text-sm text-gray-500">Số lượng tuyển</p>
                                    <p className="font-medium">{job.quantity} người</p>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <FaCalendarAlt className="text-orange-500 text-lg" />
                                <div>
                                    <p className="text-sm text-gray-500">Ngày hết hạn</p>
                                    <p className="font-medium">{formatDate(job.expiredAt)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <FaEye className="text-blue-500 text-lg" />
                                <div>
                                    <p className="text-sm text-gray-500">Lượt xem</p>
                                    <p className="font-medium">{job.viewsCount || 0}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <FaUsers className="text-green-500 text-lg" />
                                <div>
                                    <p className="text-sm text-gray-500">Lượt ứng tuyển</p>
                                    <p className="font-medium">{job.applicationCount || 0}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Categories */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Thông tin phân loại</h3>
                        <div className="flex flex-wrap gap-2">
                            {job.level && (
                                <span className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
                                    Trình độ: {typeof job.level === 'object' ? job.level.name : job.level}
                                </span>
                            )}
                            {job.jobType && (
                                <span className="px-3 py-1 text-sm font-medium bg-purple-100 text-purple-800 rounded-full">
                                    Loại: {typeof job.jobType === 'object' ? job.jobType.name : job.jobType}
                                </span>
                            )}
                            {job.industry && (
                                <span className="px-3 py-1 text-sm font-medium bg-orange-100 text-orange-800 rounded-full">
                                    Ngành: {typeof job.industry === 'object' ? job.industry.name : job.industry}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                                                 <div className="flex items-center gap-3">
                             {/* ADMIN có quyền chỉnh sửa, xóa */}
                             {user?.role === "ADMIN" && (
                                 <>
                                     <button
                                         onClick={() => navigate(`/admin/jobs/${jobId}/update`)}
                                         className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors"
                                     >
                                         <FaEdit />
                                         Chỉnh sửa
                                     </button>
                                     <button
                                         onClick={handleDeleteJob}
                                         disabled={isUpdating}
                                         className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                                     >
                                         <FaTrash />
                                         Xóa
                                     </button>
                                 </>
                             )}
                             
                             {/* ADMIN, MODERATOR, RECRUITER có quyền bật/tắt trạng thái */}
                             {(user?.role === "ADMIN" || user?.role === "MODERATOR" || user?.role === "RECRUITER") && (
                                 <button
                                     onClick={handleToggleJobStatus}
                                     disabled={isUpdating}
                                     className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                                         job.isActive 
                                             ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                                             : 'bg-green-100 text-green-700 hover:bg-green-200'
                                     }`}
                                 >
                                     {job.isActive ? <FaToggleOff /> : <FaToggleOn />}
                                     {job.isActive ? 'Tắt hoạt động' : 'Bật hoạt động'}
                                 </button>
                             )}
                         </div>

                        <div className="flex items-center gap-3">
                            {/* Nút kiểm duyệt - chỉ hiển thị cho moderator */}
                            {user?.role === "MODERATOR" && (
                                <>
                                    <button
                                        onClick={handleApproveJob}
                                        disabled={isUpdating}
                                        className="flex items-center gap-2 px-6 py-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
                                    >
                                        <FaCheck />
                                        Duyệt
                                    </button>
                                    <button
                                        onClick={handleRejectJob}
                                        disabled={isUpdating}
                                        className="flex items-center gap-2 px-6 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                                    >
                                        <FaTimes />
                                        Từ chối
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobDetailForAdminPage; 