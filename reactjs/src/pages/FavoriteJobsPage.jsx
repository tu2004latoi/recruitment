import React, { useEffect, useState } from "react";
import { authApis, endpoints } from "../configs/Apis";
import { useNavigate } from "react-router";
import { 
    FaBriefcase, 
    FaArrowLeft, 
    FaMapMarkerAlt, 
    FaMoneyBillWave, 
    FaCalendarAlt, 
    FaBuilding, 
    FaClock, 
    FaStar, 
    FaHeart,
    FaTrash,
    FaEye,
    FaBookmark
} from "react-icons/fa";

const FavoriteJobsPage = () => {
    const [favoriteJobs, setFavoriteJobs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [isRemovingFavorite, setIsRemovingFavorite] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchFavoriteJobs();
    }, []);

    const fetchFavoriteJobs = async () => {
        setIsLoading(true);
        try {
            // Fetch current user first
            const userRes = await authApis().get(endpoints["currentUser"]);
            setCurrentUser(userRes.data);

            if (userRes.data.role !== 'APPLICANT') {
                alert("Chỉ ứng viên mới có thể xem job yêu thích!");
                navigate("/jobs");
                return;
            }

            // Fetch favorite jobs using myFavorites endpoint
            const response = await authApis().get(endpoints.myFavorites);
            
            // Fetch job details for each favorite job
            const favoriteJobsWithDetails = await Promise.all(
                response.data.map(async (favoriteJob) => {
                    try {
                        const jobResponse = await authApis().get(endpoints.jobDetail(favoriteJob.jobId));
                        return {
                            ...favoriteJob,
                            job: jobResponse.data
                        };
                    } catch (err) {
                        console.error(`Failed to fetch job ${favoriteJob.jobId}:`, err);
                        return {
                            ...favoriteJob,
                            job: null // Job might be deleted
                        };
                    }
                })
            );
            
            setFavoriteJobs(favoriteJobsWithDetails);
        } catch (err) {
            console.error("Failed to fetch favorite jobs:", err);
            if (err.response?.status === 401) {
                alert("Vui lòng đăng nhập để xem job yêu thích!");
                navigate("/login");
            } else {
                alert("Không thể tải danh sách job yêu thích!");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveFavorite = async (favoriteJobId, jobId) => {
        if (!window.confirm("Bạn có chắc muốn bỏ lưu công việc này?")) {
            return;
        }

        setIsRemovingFavorite(true);
        try {
            await authApis().delete(endpoints.deleteFavorite(favoriteJobId));
            
            // Update local state
            setFavoriteJobs(prev => prev.filter(job => job.favoriteJobId !== favoriteJobId));
            alert("Đã bỏ lưu công việc!");
        } catch (err) {
            console.error("Lỗi khi bỏ lưu job:", err);
            alert("Có lỗi xảy ra khi bỏ lưu công việc!");
        } finally {
            setIsRemovingFavorite(false);
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

    const getTimeAgo = (dateString) => {
        if (!dateString) return "";
        const now = new Date();
        const jobDate = new Date(dateString);
        const diffTime = Math.abs(now - jobDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) return "Hôm nay";
        if (diffDays <= 7) return `${diffDays} ngày trước`;
        if (diffDays <= 30) return `${Math.floor(diffDays / 7)} tuần trước`;
        return `${Math.floor(diffDays / 30)} tháng trước`;
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
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
                            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                                <FaHeart className="text-white text-3xl" />
                            </div>
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-400 rounded-full border-2 border-white animate-pulse-slow"></div>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold gradient-text">Công việc yêu thích</h1>
                            <p className="text-gray-600 mt-1">Danh sách các công việc bạn đã lưu</p>
                        </div>
                    </div>
                    
                    <div className="text-right">
                        <div className="text-2xl font-bold text-red-600">{favoriteJobs.length}</div>
                        <div className="text-sm text-gray-600">Công việc đã lưu</div>
                    </div>
                </div>

                {/* Content */}
                {favoriteJobs.length === 0 ? (
                    <div className="bg-white rounded-xl p-12 text-center shadow-sm animate-fade-in-up">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FaBookmark className="text-4xl text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có công việc yêu thích</h3>
                        <p className="text-gray-600 mb-6">
                            Bạn chưa lưu công việc nào. Hãy khám phá các cơ hội việc làm và lưu lại những công việc phù hợp!
                        </p>
                        <button
                            onClick={() => navigate("/jobs")}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200"
                        >
                            Khám phá công việc
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {favoriteJobs.map((favoriteJob) => (
                            <div key={favoriteJob.favoriteJobId} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 animate-fade-in-up">
                                {/* Job Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center">
                                                <FaBriefcase className="text-white text-sm" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2">
                                                    {favoriteJob.job?.title || "Công việc không tồn tại"}
                                                </h3>
                                                {favoriteJob.job?.user && (
                                                    <p className="text-sm text-gray-600 flex items-center gap-1">
                                                        <FaBuilding className="text-blue-500" />
                                                        {favoriteJob.job.user.firstName} {favoriteJob.job.user.lastName}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {favoriteJob.job?.isFeatured && (
                                            <div className="flex items-center gap-1 text-yellow-500 mb-2">
                                                <FaStar className="text-xs" />
                                                <span className="text-xs font-medium">Công việc nổi bật</span>
                                            </div>
                                        )}
                                        
                                        {/* Hiển thị thông báo nếu job đã bị xóa */}
                                        {!favoriteJob.job && (
                                            <div className="flex items-center gap-1 text-red-500 mb-2">
                                                <FaTrash className="text-xs" />
                                                <span className="text-xs font-medium">Công việc đã bị xóa</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Job Info */}
                                <div className="space-y-2 mb-4">
                                    {favoriteJob.job?.location && (
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <FaMapMarkerAlt className="text-blue-500" />
                                            <span className="line-clamp-1">
                                                {typeof favoriteJob.job.location === 'object' 
                                                    ? `${favoriteJob.job.location.province}, ${favoriteJob.job.location.district}` 
                                                    : favoriteJob.job.location}
                                            </span>
                                        </div>
                                    )}
                                    
                                    {favoriteJob.job?.salary && (
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <FaMoneyBillWave className="text-green-500" />
                                            <span>{formatSalary(favoriteJob.job.salary)}</span>
                                        </div>
                                    )}
                                    
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <FaCalendarAlt className="text-red-500" />
                                        <span>Hết hạn: {formatDate(favoriteJob.job?.expiredAt)}</span>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <FaClock className="text-purple-500" />
                                        <span>Lưu: {getTimeAgo(favoriteJob.favoritedAt)}</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 pt-4 border-t border-gray-100">
                                    {favoriteJob.job ? (
                                        <button
                                            onClick={() => navigate(`/jobs/${favoriteJob.jobId}`)}
                                            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                                        >
                                            <FaEye className="text-xs" />
                                            Xem chi tiết
                                        </button>
                                    ) : (
                                        <button
                                            disabled
                                            className="flex-1 bg-gray-300 text-gray-500 py-2 px-4 rounded-lg text-sm font-medium cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            <FaEye className="text-xs" />
                                            Không khả dụng
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleRemoveFavorite(favoriteJob.favoriteJobId, favoriteJob.jobId)}
                                        disabled={isRemovingFavorite}
                                        className="px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 disabled:opacity-50 flex items-center gap-1"
                                        title="Bỏ lưu công việc"
                                    >
                                        <FaTrash className="text-xs" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FavoriteJobsPage; 