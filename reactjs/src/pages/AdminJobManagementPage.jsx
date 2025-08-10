import React, { useEffect, useState } from "react";
import { authApis, endpoints } from "../configs/Apis";
import { useNavigate } from "react-router";
import {
    FaBriefcase,
    FaSearch,
    FaMapMarkerAlt,
    FaMoneyBillWave,
    FaCalendarAlt,
    FaFilter,
    FaEye,
    FaUsers,
    FaBuilding,
    FaClock,
    FaStar,
    FaEdit,
    FaTrash,
    FaCheck,
    FaTimes,
    FaPlus,
    FaToggleOn,
    FaToggleOff,
    FaUserShield
} from "react-icons/fa";

const AdminJobManagementPage = () => {
    const [jobs, setJobs] = useState([]);
    const [filteredJobs, setFilteredJobs] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedLevel, setSelectedLevel] = useState("");
    const [selectedJobType, setSelectedJobType] = useState("");
    const [selectedIndustry, setSelectedIndustry] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");
    const [selectedRecruiter, setSelectedRecruiter] = useState("");
    const [selectedSalary, setSelectedSalary] = useState("");
    const [levels, setLevels] = useState([]);
    const [jobTypes, setJobTypes] = useState([]);
    const [industries, setIndustries] = useState([]);
    const [recruiters, setRecruiters] = useState([]);
    const [showFilters, setShowFilters] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [user, setUser] = useState(null);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
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
            fetchData(0);
        }
    }, [user]);

    useEffect(() => {
        filterJobs();
    }, [jobs, searchTerm, selectedLevel, selectedJobType, selectedIndustry, selectedStatus, selectedRecruiter]);

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

    const fetchData = async () => {
        setIsLoading(true);
        try {
            // Build query params for search API
            const params = {};
            if (searchTerm) params.title = searchTerm;
            if (selectedLevel) params.levelId = selectedLevel;
            if (selectedJobType) params.jobTypeId = selectedJobType;
            if (selectedIndustry) params.industryId = selectedIndustry;
            if (selectedSalary) params.salary = selectedSalary;

            // Nếu backend có endpoint search cho admin, dùng endpoints["jobSearch"], nếu không thì endpoints["jobs"]
            const jobsRes = await authApis().get(endpoints["jobSearch"] || endpoints["jobs"], { params });
            const jobsArray = Array.isArray(jobsRes.data) ? jobsRes.data : (jobsRes.data?.content || []);
            setJobs(jobsArray);
            setFilteredJobs(jobsArray);
            setTotalPages(jobsRes.data?.totalPages || 1);
            setPage(0);

            // Fetch các tùy chọn filter
            const [levelsRes, jobTypesRes, industriesRes, recruitersRes] = await Promise.all([
                authApis().get(endpoints["levels"]),
                authApis().get(endpoints["jobTypes"]),
                authApis().get(endpoints["jobIndustries"]),
                authApis().get(endpoints["users"])
            ]);
            setLevels(levelsRes.data);
            setJobTypes(jobTypesRes.data);
            setIndustries(industriesRes.data);
            const recruiterUsers = recruitersRes.data.filter(u => u.role === "RECRUITER");
            setRecruiters(recruiterUsers);
        } catch (err) {
            console.error("Failed to fetch data:", err);
            alert("Không thể tải dữ liệu!");
        } finally {
            setIsLoading(false);
        }
    };

    const filterJobs = () => {
        let filtered = jobs;

        // Tìm kiếm theo tiêu đề, mô tả, địa điểm
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(job =>
                (job.title?.toLowerCase().includes(term)) ||
                (job.description?.toLowerCase().includes(term)) ||
                (
                    typeof job.location === "string"
                        ? job.location.toLowerCase().includes(term)
                        : (
                            job.location && typeof job.location === "object"
                                ? (
                                    [
                                        job.location.province,
                                        job.location.district,
                                        job.location.address
                                    ]
                                        .filter(Boolean)
                                        .join(", ")
                                        .toLowerCase()
                                        .includes(term)
                                )
                                : false
                        )
                )
            );
        }

        // Lọc theo trình độ
        if (selectedLevel) {
            filtered = filtered.filter(job => 
                job.level?.levelId?.toString() === selectedLevel
            );
        }

        // Lọc theo loại công việc
        if (selectedJobType) {
            filtered = filtered.filter(job => 
                job.jobType?.jobTypeId?.toString() === selectedJobType
            );
        }

        // Lọc theo ngành nghề
        if (selectedIndustry) {
            filtered = filtered.filter(job => 
                job.industry?.industryId?.toString() === selectedIndustry
            );
        }

        // Lọc theo trạng thái
        if (selectedStatus) {
            if (selectedStatus === "active") {
                filtered = filtered.filter(job => job.isActive);
            } else if (selectedStatus === "inactive") {
                filtered = filtered.filter(job => !job.isActive);
            } else if (selectedStatus === "PENDING") {
                filtered = filtered.filter(job => job.status === "PENDING");
            } else if (selectedStatus === "APPROVED") {
                filtered = filtered.filter(job => job.status === "APPROVED");
            } else if (selectedStatus === "REJECTED") {
                filtered = filtered.filter(job => job.status === "REJECTED");
            }
        }

        // Lọc theo recruiter
        if (selectedRecruiter) {
            filtered = filtered.filter(job => 
                job.recruiter?.userId?.toString() === selectedRecruiter
            );
        }

        setFilteredJobs(filtered);
    };

    const clearFilters = () => {
        setSearchTerm("");
        setSelectedLevel("");
        setSelectedJobType("");
        setSelectedIndustry("");
        setSelectedStatus("");
        setSelectedRecruiter("");
        setSelectedSalary("");
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

    const handleViewJob = (jobId) => {
        // Mở modal hoặc navigate đến trang chi tiết để xem trước khi duyệt
        navigate(`/admin/jobs/${jobId}/view`);
    };

    const handleEditJob = (e, jobId) => {
        e.stopPropagation();
        navigate(`/admin/jobs/${jobId}/update`);
    };

    const handleDeleteJob = async (e, jobId) => {
        e.stopPropagation();
        if (!window.confirm("Bạn có chắc chắn muốn xóa công việc này?")) return;
        
        setIsDeleting(true);
        try {
            await authApis().delete(endpoints.deleteJob(jobId));
            alert("Xóa công việc thành công!");
            setJobs(jobs.filter(j => j.jobId !== jobId));
            setFilteredJobs(filteredJobs.filter(j => j.jobId !== jobId));
        } catch (err) {
            alert("Xóa công việc thất bại!");
            console.error(err);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleToggleJobStatus = async (e, jobId, currentStatus) => {
        e.stopPropagation();
        setIsUpdating(true);
        try {
            const activationDTO = {
                isActive: !currentStatus
            };
            await authApis().patch(endpoints.activationJob(jobId), activationDTO);
            alert(`Đã ${currentStatus ? 'tắt' : 'bật'} trạng thái công việc!`);
            // Refresh danh sách
            fetchData(page);
        } catch (err) {
            alert("Cập nhật trạng thái thất bại!");
            console.error(err);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleApproveJob = async (e, jobId) => {
        e.stopPropagation();
        setIsUpdating(true);
        try {
            const moderatorJobDTO = {
                jobId: jobId,
                moderatorId: user.userId
            };
            await authApis().patch(endpoints.approveJob(jobId), moderatorJobDTO);
            alert("Đã duyệt công việc thành công!");
            // Refresh danh sách
            fetchData(page);
        } catch (err) {
            alert("Không thể duyệt công việc!");
            console.error(err);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleRejectJob = async (e, jobId) => {
        e.stopPropagation();
        setIsUpdating(true);
        try {
            const moderatorJobDTO = {
                jobId: jobId,
                moderatorId: user.userId
            };
            await authApis().patch(endpoints.rejectJob(jobId), moderatorJobDTO);
            alert("Đã từ chối công việc!");
            // Refresh danh sách
            fetchData(page);
        } catch (err) {
            alert("Không thể từ chối công việc!");
            console.error(err);
        } finally {
            setIsUpdating(false);
        }
    };

    const getStatusBadge = (isActive, status) => {
        if (isActive) {
            return (
                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full flex items-center gap-1">
                    <FaCheck className="text-xs" />
                    Hoạt động
                </span>
            );
        } else {
            return (
                <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full flex items-center gap-1">
                    <FaTimes className="text-xs" />
                    Không hoạt động
                </span>
            );
        }
    };

    const getApprovalStatusBadge = (status) => {
        switch (status) {
            case "PENDING":
                return (
                    <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full flex items-center gap-1">
                        <FaClock className="text-xs" />
                        Chờ duyệt
                    </span>
                );
            case "APPROVED":
                return (
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full flex items-center gap-1">
                        <FaCheck className="text-xs" />
                        Đã duyệt
                    </span>
                );
            case "REJECTED":
                return (
                    <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full flex items-center gap-1">
                        <FaTimes className="text-xs" />
                        Từ chối
                    </span>
                );
            default:
                return (
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full flex items-center gap-1">
                        <FaClock className="text-xs" />
                        Chờ duyệt
                    </span>
                );
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col items-center mb-8">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <FaUserShield className="text-white text-4xl" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                {user?.role === "ADMIN" ? "Quản lý công việc" : "Kiểm duyệt công việc"}
                            </h1>
                            <p className="text-gray-600">
                                {user?.role === "ADMIN"
                                    ? "Quản lý tất cả công việc trong hệ thống"
                                    : "Kiểm duyệt các công việc chờ phê duyệt"
                                }
                            </p>
                        </div>
                    </div>
                    <p className="text-gray-500 text-sm">Tổng cộng {filteredJobs.length} công việc</p>
                    {user?.role === "ADMIN" && (
                        <button
                            onClick={() => navigate("/admin/jobs/add")}
                            className="mt-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-2 rounded-lg font-semibold shadow hover:shadow-lg flex items-center gap-2"
                        >
                            <FaPlus />
                            Thêm công việc mới
                        </button>
                    )}
                </div>

                {/* Thống kê */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    {/* Tổng công việc */}
                    <div className="bg-white rounded-lg p-5 shadow flex items-center gap-4 border-l-4 border-blue-500">
                        <div className="w-12 h-12 bg-blue-100 rounded flex items-center justify-center">
                            <FaBriefcase className="text-blue-600 text-2xl" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Tổng công việc</p>
                            <p className="text-xl font-bold">{jobs.length}</p>
                        </div>
                    </div>
                    {/* Đang hoạt động / Chờ duyệt */}
                    <div className="bg-white rounded-lg p-5 shadow flex items-center gap-4 border-l-4 border-green-500">
                        <div className="w-12 h-12 bg-green-100 rounded flex items-center justify-center">
                            {user?.role === "ADMIN"
                                ? <FaCheck className="text-green-600 text-2xl" />
                                : <FaClock className="text-green-600 text-2xl" />}
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">
                                {user?.role === "ADMIN" ? "Đang hoạt động" : "Chờ duyệt"}
                            </p>
                            <p className="text-xl font-bold text-green-600">
                                {user?.role === "ADMIN"
                                    ? jobs.filter(j => j.isActive).length
                                    : jobs.filter(j => j.status === "PENDING").length}
                            </p>
                        </div>
                    </div>
                    {/* Không hoạt động / Đã duyệt */}
                    <div className="bg-white rounded-lg p-5 shadow flex items-center gap-4 border-l-4 border-red-500">
                        <div className="w-12 h-12 bg-red-100 rounded flex items-center justify-center">
                            {user?.role === "ADMIN"
                                ? <FaTimes className="text-red-600 text-2xl" />
                                : <FaCheck className="text-red-600 text-2xl" />}
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">
                                {user?.role === "ADMIN" ? "Không hoạt động" : "Đã duyệt"}
                            </p>
                            <p className="text-xl font-bold text-red-600">
                                {user?.role === "ADMIN"
                                    ? jobs.filter(j => !j.isActive).length
                                    : jobs.filter(j => j.status === "APPROVED").length}
                            </p>
                        </div>
                    </div>
                    {/* Nổi bật / Từ chối */}
                    <div className="bg-white rounded-lg p-5 shadow flex items-center gap-4 border-l-4 border-yellow-500">
                        <div className="w-12 h-12 bg-yellow-100 rounded flex items-center justify-center">
                            {user?.role === "ADMIN"
                                ? <FaStar className="text-yellow-600 text-2xl" />
                                : <FaTimes className="text-yellow-600 text-2xl" />}
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">
                                {user?.role === "ADMIN" ? "Nổi bật" : "Từ chối"}
                            </p>
                            <p className="text-xl font-bold text-yellow-600">
                                {user?.role === "ADMIN"
                                    ? jobs.filter(j => j.isFeatured).length
                                    : jobs.filter(j => j.status === "REJECTED").length}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Bộ lọc và tìm kiếm */}
                <div className="bg-white rounded-lg shadow p-6 mb-8 border">
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                        <div className="flex-1 relative w-full">
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm công việc, địa điểm..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 border"
                        >
                            <FaFilter />
                            Bộ lọc
                        </button>
                        {(searchTerm || selectedLevel || selectedJobType || selectedIndustry || selectedStatus || selectedRecruiter) && (
                            <button
                                onClick={clearFilters}
                                className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 border"
                            >
                                Xóa bộ lọc
                            </button>
                        )}
                    </div>
                    {showFilters && (
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                                <select
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded"
                                >
                                    <option value="">Tất cả trạng thái</option>
                                    {user?.role === "ADMIN" ? (
                                        <>
                                            <option value="active">Đang hoạt động</option>
                                            <option value="inactive">Không hoạt động</option>
                                        </>
                                    ) : (
                                        <>
                                            <option value="PENDING">Chờ duyệt</option>
                                            <option value="APPROVED">Đã duyệt</option>
                                            <option value="REJECTED">Từ chối</option>
                                        </>
                                    )}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nhà tuyển dụng</label>
                                <select
                                    value={selectedRecruiter}
                                    onChange={(e) => setSelectedRecruiter(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded"
                                >
                                    <option value="">Tất cả nhà tuyển dụng</option>
                                    {recruiters.map(recruiter => (
                                        <option key={recruiter.userId} value={recruiter.userId}>
                                            {recruiter.firstName} {recruiter.lastName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Trình độ</label>
                                <select
                                    value={selectedLevel}
                                    onChange={(e) => setSelectedLevel(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded"
                                >
                                    <option value="">Tất cả trình độ</option>
                                    {levels.map(level => (
                                        <option key={level.levelId} value={level.levelId}>
                                            {level.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Loại công việc</label>
                                <select
                                    value={selectedJobType}
                                    onChange={(e) => setSelectedJobType(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded"
                                >
                                    <option value="">Tất cả loại công việc</option>
                                    {jobTypes.map(jobType => (
                                        <option key={jobType.jobTypeId} value={jobType.jobTypeId}>
                                            {jobType.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ngành nghề</label>
                                <select
                                    value={selectedIndustry}
                                    onChange={(e) => setSelectedIndustry(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded"
                                >
                                    <option value="">Tất cả ngành nghề</option>
                                    {industries.map(industry => (
                                        <option key={industry.industryId} value={industry.industryId}>
                                            {industry.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mức lương tối thiểu</label>
                                <input
                                    type="number"
                                    min={0}
                                    value={selectedSalary}
                                    onChange={e => setSelectedSalary(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded"
                                    placeholder="Nhập mức lương"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Trạng thái loading */}
                {isLoading && (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                )}

                {/* Danh sách công việc dạng bảng */}
                {!isLoading && (
                    <>
                        {filteredJobs.length === 0 ? (
                            <div className="bg-white rounded-lg p-12 text-center shadow">
                                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <FaBriefcase className="text-blue-600 text-3xl" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy công việc nào</h3>
                                <p className="text-gray-600 mb-8">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc</p>
                                <button
                                    onClick={clearFilters}
                                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg"
                                >
                                    Xem tất cả công việc
                                </button>
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 rounded-xl">
                                    <thead>
                                        <tr className="bg-gradient-to-r from-blue-50 to-indigo-100 border-b-2 border-blue-200">
                                            <th className="px-4 py-3 text-center text-xs font-bold text-blue-700 uppercase tracking-wider">#</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Tiêu đề</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Nhà tuyển dụng</th>
                                            <th className="px-4 py-3 text-center text-xs font-bold text-blue-700 uppercase tracking-wider">Trạng thái</th>
                                            <th className="px-4 py-3 text-center text-xs font-bold text-blue-700 uppercase tracking-wider">Kiểm duyệt</th>
                                            <th className="px-4 py-3 text-center text-xs font-bold text-blue-700 uppercase tracking-wider">Hết hạn</th>
                                            <th className="px-4 py-3 text-center text-xs font-bold text-blue-700 uppercase tracking-wider">Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100">
                                        {filteredJobs.map((job, idx) => (
                                            <tr key={job.jobId} className="hover:bg-blue-50 transition rounded-lg">
                                                <td className="px-4 py-3 text-center font-semibold text-gray-700">{idx + 1}</td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <FaBriefcase className="text-blue-500" />
                                                        <span className="font-semibold text-gray-900">{job.title}</span>
                                                        {job.isFeatured && (
                                                            <span className="ml-2 text-yellow-500" title="Nổi bật">
                                                                <FaStar />
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
                                                    <div className="flex items-center gap-1 text-gray-800 font-medium">
                                                        <FaBuilding className="text-blue-400" />
                                                        <span>
                                                            {job.recruiter ? `${job.recruiter.firstName} ${job.recruiter.lastName}` : ""}
                                                        </span>
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        {typeof job.location === "object" && job.location !== null
                                                            ? [
                                                                job.location.province,
                                                                job.location.district,
                                                                job.location.address
                                                            ].filter(Boolean).join(", ")
                                                            : job.location}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    {getStatusBadge(job.isActive, job.status)}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    {getApprovalStatusBadge(job.status)}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className="flex flex-col items-center gap-1">
                                                        <span className="flex items-center gap-1">
                                                            <FaCalendarAlt className="text-gray-400" />
                                                            <span className="font-medium">{formatDate(job.expiredAt)}</span>
                                                        </span>
                                                        <span className="flex items-center gap-1 text-xs text-gray-400">
                                                            <FaClock />
                                                            <span>{getTimeAgo(job.createdAt)}</span>
                                                        </span>
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <div className="flex flex-wrap gap-1 justify-center">
                                                        <button
                                                            onClick={() => handleViewJob(job.jobId)}
                                                            className="p-2 border border-blue-200 rounded hover:bg-blue-100 text-blue-600 transition"
                                                            title="Xem chi tiết"
                                                        >
                                                            <FaEye />
                                                        </button>
                                                        {user?.role === "ADMIN" && (
                                                            <button
                                                                onClick={(e) => handleEditJob(e, job.jobId)}
                                                                className="p-2 border border-yellow-200 rounded hover:bg-yellow-100 text-yellow-600 transition"
                                                                title="Chỉnh sửa"
                                                            >
                                                                <FaEdit />
                                                            </button>
                                                        )}
                                                        {(user?.role === "ADMIN" || user?.role === "MODERATOR" || user?.role === "RECRUITER") && (
                                                            <button
                                                                onClick={(e) => handleToggleJobStatus(e, job.jobId, job.isActive)}
                                                                disabled={isUpdating}
                                                                className={`p-2 border rounded transition ${job.isActive ? "border-red-200 hover:bg-red-100 text-red-600" : "border-green-200 hover:bg-green-100 text-green-600"}`}
                                                                title={job.isActive ? "Tắt hoạt động" : "Bật hoạt động"}
                                                            >
                                                                {job.isActive ? <FaToggleOff /> : <FaToggleOn />}
                                                            </button>
                                                        )}
                                                        {user?.role === "MODERATOR" && (
                                                            <>
                                                                <button
                                                                    onClick={(e) => handleApproveJob(e, job.jobId)}
                                                                    disabled={isUpdating}
                                                                    className="p-2 border border-green-200 rounded hover:bg-green-100 text-green-600 transition"
                                                                    title="Duyệt công việc"
                                                                >
                                                                    <FaCheck />
                                                                </button>
                                                                <button
                                                                    onClick={(e) => handleRejectJob(e, job.jobId)}
                                                                    disabled={isUpdating}
                                                                    className="p-2 border border-red-200 rounded hover:bg-red-100 text-red-600 transition"
                                                                    title="Từ chối công việc"
                                                                >
                                                                    <FaTimes />
                                                                </button>
                                                            </>
                                                        )}
                                                        {user?.role === "ADMIN" && (
                                                            <button
                                                                onClick={(e) => handleDeleteJob(e, job.jobId)}
                                                                disabled={isDeleting}
                                                                className="p-2 border border-red-300 rounded hover:bg-red-200 text-red-700 transition"
                                                                title="Xóa công việc"
                                                            >
                                                                <FaTrash />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}

                {/* Phân trang */}
                {!isLoading && filteredJobs.length > 0 && (
                    <div className="flex justify-center mt-8 gap-2">
                        <button
                            className="px-3 py-1 rounded border bg-white hover:bg-blue-50 disabled:opacity-50"
                            onClick={() => fetchData(page - 1)}
                            disabled={page === 0}
                        >
                            Trang trước
                        </button>
                        {[...Array(totalPages)].map((_, idx) => (
                            <button
                                key={idx}
                                className={`px-3 py-1 rounded border ${page === idx ? "bg-blue-600 text-white" : "bg-white hover:bg-blue-50"}`}
                                onClick={() => fetchData(idx)}
                            >
                                {idx + 1}
                            </button>
                        ))}
                        <button
                            className="px-3 py-1 rounded border bg-white hover:bg-blue-50 disabled:opacity-50"
                            onClick={() => fetchData(page + 1)}
                            disabled={page === totalPages - 1}
                        >
                            Trang sau
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminJobManagementPage;