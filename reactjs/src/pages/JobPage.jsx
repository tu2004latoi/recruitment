import React, { useEffect, useState, useContext } from "react";
import { authApis, endpoints } from "../configs/Apis";
import { useNavigate } from "react-router";
import { FaBriefcase, FaEdit, FaTrash, FaPlus, FaArrowLeft, FaEye, FaUsers, FaMapMarkerAlt, FaMoneyBillWave, FaCalendarAlt } from "react-icons/fa";
import { MyUserContext } from "../configs/MyContexts";

const JobPage = () => {
    const [jobs, setJobs] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        setIsLoading(true);
        try {
            // Get current user first
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
                            <h1 className="text-4xl font-bold gradient-text">Quản lý công việc</h1>
                            <p className="text-gray-600 mt-1">
                                {currentUser ? `Công việc của ${currentUser.firstName} ${currentUser.lastName}` : "Đang tải..."}
                            </p>
                            <p className="text-gray-500 text-sm">Tổng cộng {jobs.length} công việc</p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate("/recruiter/jobs/add")}
                        className="group relative bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 animate-slide-in-right"
                    >
                        <span className="flex items-center gap-2 relative z-10">
                            <FaPlus className="text-xl animate-pulse-slow" />
                            Thêm công việc
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 animate-fade-in-up hover-lift">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Tổng công việc</p>
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

                {/* Loading State */}
                {isLoading && (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                )}

                {/* Jobs Table */}
                {!isLoading && (
                    <div className="bg-white shadow rounded-xl overflow-hidden">
    <div className="px-6 py-4 border-b flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-100">
        <h2 className="text-lg font-bold text-blue-700 uppercase tracking-wider">
            Danh sách công việc của bạn
        </h2>
        <span className="text-sm text-gray-500">
            Tổng: <b>{jobs.length}</b>
        </span>
    </div>
    <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
            <thead>
                <tr>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase bg-gray-50">#</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase bg-gray-50">Tiêu đề</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase bg-gray-50">Địa điểm</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase bg-gray-50">Trạng thái</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase bg-gray-50">Số lượng</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase bg-gray-50">Ứng tuyển</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase bg-gray-50">Hết hạn</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase bg-gray-50">Hành động</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
                {jobs.length === 0 ? (
                    <tr>
                        <td colSpan={8} className="py-12 text-center text-gray-500">
                            <div className="flex flex-col items-center">
                                <FaBriefcase className="text-4xl mb-2 text-gray-300" />
                                <div>Chưa có tin tuyển dụng nào</div>
                            </div>
                        </td>
                    </tr>
                ) : (
                    jobs.map((job, idx) => (
                        <tr key={job.jobId} className="hover:bg-blue-50 transition">
                            <td className="px-4 py-3 text-center">{idx + 1}</td>
                            <td className="px-4 py-3">
                                <div className="font-semibold text-gray-900 flex items-center gap-2">
                                    {job.title}
                                    {job.isFeatured && (
                                        <span className="ml-1 px-2 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded" title="Nổi bật">
                                            Nổi bật
                                        </span>
                                    )}
                                </div>
                                <div className="text-xs text-gray-500 truncate max-w-xs" title={job.description}>
                                    {job.description}
                                </div>
                                <div className="flex gap-2 mt-1">
                                    {job.level && (
                                        <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">
                                            {typeof job.level === 'object' ? job.level.name : job.level}
                                        </span>
                                    )}
                                    {job.jobType && (
                                        <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-800 rounded">
                                            {typeof job.jobType === 'object' ? job.jobType.name : job.jobType}
                                        </span>
                                    )}
                                    {job.industry && (
                                        <span className="px-2 py-0.5 text-xs bg-orange-100 text-orange-800 rounded">
                                            {typeof job.industry === 'object' ? job.industry.name : job.industry}
                                        </span>
                                    )}
                                </div>
                            </td>
                            <td className="px-4 py-3">
                                <div className="flex items-center gap-1 text-gray-700">
                                    <FaMapMarkerAlt className="text-blue-400" />
                                    <span>
                                        {typeof job.location === 'object' && job.location !== null
                                            ? [job.location.province, job.location.district, job.location.address].filter(Boolean).join(", ")
                                            : job.location}
                                    </span>
                                </div>
                                <div className="text-xs text-gray-500">
                                    {job.salary && (
                                        <span>
                                            <FaMoneyBillWave className="inline mr-1 text-green-500" />
                                            {formatSalary(job.salary)}
                                        </span>
                                    )}
                                </div>
                            </td>
                            <td className="px-4 py-3 text-center">
                                {getStatusBadge(job.isActive, job.isFeatured)}
                            </td>
                            <td className="px-4 py-3 text-center">{job.quantity}</td>
                            <td className="px-4 py-3 text-center">{job.applicationCount || 0}</td>
                            <td className="px-4 py-3 text-center">
                                <span className="flex items-center gap-1 justify-center text-xs text-gray-500">
                                    <FaCalendarAlt />
                                    {formatDate(job.expiredAt)}
                                </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                                <div className="flex gap-1 justify-center">
                                    <button
                                        onClick={() => navigate(`/recruiter/jobs/${job.jobId}/update`)}
                                        className="p-2 border border-blue-200 rounded hover:bg-blue-100 text-blue-600 transition"
                                        title="Sửa"
                                    >
                                        <FaEdit />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(job.jobId)}
                                        className="p-2 border border-red-200 rounded hover:bg-red-100 text-red-600 transition"
                                        title="Xóa"
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))
                )}
            </tbody>
        </table>
    </div>
</div>
                )}
            </div>
        </div>
    );
};


export default JobPage;
