import React, { useEffect, useState, useContext } from "react";
import { authApis, endpoints } from "../configs/Apis";
import { useNavigate } from "react-router";
import { FaBriefcase, FaSearch, FaMapMarkerAlt, FaMoneyBillWave, FaCalendarAlt, FaFilter, FaEye, FaUsers, FaBuilding, FaClock, FaStar } from "react-icons/fa";
import { MyUserContext } from "../configs/MyContexts";
import LocationService from "../services/LocationService";
import LocationDisplay from "../components/LocationDisplay";

import { useTranslation } from "react-i18next";

const JobListingPage = () => {
    const [jobs, setJobs] = useState([]);
    const [filteredJobs, setFilteredJobs] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedLevel, setSelectedLevel] = useState("");
    const [selectedJobType, setSelectedJobType] = useState("");
    const [selectedIndustry, setSelectedIndustry] = useState("");
    const [selectedSalary, setSelectedSalary] = useState("");
    const [isFeatured, setIsFeatured] = useState(false);
    const [myLevelOnly, setMyLevelOnly] = useState(false);
    const [sortBy, setSortBy] = useState(""); // '', 'viewsCount', 'applicationCount'
    const [sortDirection] = useState("desc");
    const [levels, setLevels] = useState([]);
    const [jobTypes, setJobTypes] = useState([]);
    const [industries, setIndustries] = useState([]);
    const [showFilters, setShowFilters] = useState(false);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [size] = useState(6); // Số lượng job mỗi trang
    const navigate = useNavigate();
    const user = useContext(MyUserContext);
    const { t } = useTranslation();

    useEffect(() => {
        fetchData(0);
    }, []);

    useEffect(() => {
        filterJobs();
    }, [jobs, searchTerm, selectedLevel, selectedJobType, selectedIndustry]);

    useEffect(() => {
        fetchData(page);
        // eslint-disable-next-line
    }, [page]);

    const fetchData = async (pageNumber = 0) => {
        setIsLoading(true);
        try {
            // Build query params for search API
            const params = {
                page: pageNumber,
                size,
            };
            const useSuitable = myLevelOnly && user && user.userId;
            if (!useSuitable) {
                if (searchTerm) params.title = searchTerm;
                if (selectedLevel) params.levelId = selectedLevel;
                if (selectedJobType) params.jobTypeId = selectedJobType;
                if (selectedIndustry) params.industryId = selectedIndustry;
                if (selectedSalary) params.salary = selectedSalary;
                if (isFeatured) params.isFeatured = true;
                if (sortBy) {
                    params.sortBy = sortBy; // 'viewsCount' | 'applicationCount'
                    params.sortDirection = sortDirection; // 'desc'
                }
            }
            // Có thể bổ sung locationId nếu muốn

            // Gọi API searchJobs
            const url = useSuitable ? endpoints["suitableJobs"](user.userId) : endpoints["jobSearch"];
            const jobsRes = await authApis().get(url, { params });
            const jobsPage = jobsRes.data;
            const jobsArr = Array.isArray(jobsPage.content) ? jobsPage.content : [];
            // Chỉ lấy job active và đã duyệt (nếu muốn)
            const approvedActiveJobs = jobsArr.filter(job => job.isActive && job.status === "APPROVED");
            const jobsWithLocations = await Promise.all(
                approvedActiveJobs.map(async (job) => {
                    if (job.locationId) {
                        try {
                            const locationRes = await LocationService.getLocationById(job.locationId);
                            job.location = LocationService.formatLocation(locationRes);
                        } catch (locationErr) {
                            console.error("Failed to fetch location for job:", job.jobId, locationErr);
                            job.location = t('jobListing.labels.unknown');
                        }
                    }
                    return job;
                })
            );
            setJobs(jobsWithLocations);
            setFilteredJobs(jobsWithLocations);
            setTotalPages(jobsPage.totalPages || 1);
            setPage(pageNumber);

            // Fetch filter options
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
            alert(t('jobListing.alerts.loadFailed'));
        } finally {
            setIsLoading(false);
        }
    };

    const filterJobs = () => {
        let filtered = jobs;

        // Search by title, description, or location
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

        // Filter by level
        if (selectedLevel) {
            filtered = filtered.filter(job =>
                job.level?.levelId?.toString() === selectedLevel
            );
        }

        // Filter by job type
        if (selectedJobType) {
            filtered = filtered.filter(job =>
                job.jobType?.jobTypeId?.toString() === selectedJobType
            );
        }

        // Filter by industry
        if (selectedIndustry) {
            filtered = filtered.filter(job =>
                job.industry?.industryId?.toString() === selectedIndustry
            );
        }

        setFilteredJobs(filtered);
    };

    const clearFilters = () => {
        setSearchTerm("");
        setSelectedLevel("");
        setSelectedJobType("");
        setSelectedIndustry("");
        setSelectedSalary("");
        setIsFeatured(false);
        setSortBy("");
        setMyLevelOnly(false);
    };

    const formatDate = (dateString) => {
        if (!dateString) return t('jobListing.labels.unknown');
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    const formatSalary = (salary) => {
        if (!salary) return t('jobDetail.salary.negotiable');
        return new Intl.NumberFormat('vi-VN').format(salary) + " " + t('jobDetail.currency.vnd');
    };

    const getTimeAgo = (dateString) => {
        if (!dateString) return "";
        const now = new Date();
        const jobDate = new Date(dateString);
        const diffTime = Math.abs(now - jobDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) return t('jobDetail.time.today');
        if (diffDays <= 7) return t('jobDetail.time.daysAgo', { count: diffDays });
        if (diffDays <= 30) return t('jobDetail.time.weeksAgo', { count: Math.floor(diffDays / 7) });
        return t('jobDetail.time.monthsAgo', { count: Math.floor(diffDays / 30) });
    };

    const handleJobClick = (jobId) => {
        navigate(`/jobs/${jobId}`);
    };

    // Khi filter/search thay đổi, reset về trang 0 và gọi fetchData(0)
    useEffect(() => {
        setPage(0);
        fetchData(0);
        // eslint-disable-next-line
    }, [searchTerm, selectedLevel, selectedJobType, selectedIndustry, selectedSalary, isFeatured, sortBy, myLevelOnly]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8 animate-fade-in-up">
                    <div className="flex items-center gap-4">
                        <div className="relative animate-pulse-slow">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                                <FaBriefcase className="text-white text-3xl" />
                            </div>
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-2 border-white animate-pulse-slow"></div>
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold gradient-text">Tìm việc làm</h1>
                            <p className="text-gray-600 mt-1">Khám phá cơ hội nghề nghiệp phù hợp với bạn</p>
                            <p className="text-gray-500 text-sm">Tìm thấy {filteredJobs.length} công việc phù hợp</p>
                        </div>
                    </div>
                    {user && user.role === "RECRUITER" && (
                        <button
                            onClick={() => navigate("/recruiter")}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                        >
                            Đăng tin tuyển dụng
                        </button>
                    )}
                </div>

                {/* Search and Filters */}
                <div className="bg-white rounded-xl p-6 shadow-sm mb-8 animate-fade-in-up">
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search Bar */}
                        <div className="flex-1 relative">
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm công việc, địa điểm..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            />
                        </div>

                        {/* Filter Toggle */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200"
                        >
                            <FaFilter />
                            Bộ lọc
                        </button>

                        {/* Clear Filters */}
                        {(searchTerm || selectedLevel || selectedJobType || selectedIndustry || selectedSalary || isFeatured || sortBy || myLevelOnly) && (
                            <button
                                onClick={clearFilters}
                                className="px-6 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all duration-200"
                            >
                                Xóa bộ lọc
                            </button>
                        )}
                    </div>

                    {/* Filter Options */}
                    {showFilters && (
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Trình độ
                                    </label>
                                    <select
                                        value={selectedLevel}
                                        onChange={(e) => setSelectedLevel(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Loại công việc
                                    </label>
                                    <select
                                        value={selectedJobType}
                                        onChange={(e) => setSelectedJobType(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Ngành nghề
                                    </label>
                                    <select
                                        value={selectedIndustry}
                                        onChange={(e) => setSelectedIndustry(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Mức lương tối thiểu
                                    </label>
                                    <input
                                        type="number"
                                        min={0}
                                        value={selectedSalary}
                                        onChange={e => setSelectedSalary(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Nhập mức lương"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                <div className="flex items-center gap-2">
                                    <input
                                        id="isFeatured"
                                        type="checkbox"
                                        checked={isFeatured}
                                        onChange={(e) => setIsFeatured(e.target.checked)}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <label htmlFor="isFeatured" className="text-sm font-medium text-gray-700">
                                        Chỉ hiển thị tin nổi bật
                                    </label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        id="myLevelOnly"
                                        type="checkbox"
                                        checked={myLevelOnly}
                                        onChange={(e) => setMyLevelOnly(e.target.checked)}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <label htmlFor="myLevelOnly" className="text-sm font-medium text-gray-700">
                                        Công việc phù hợp với trình độ của tôi
                                    </label>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Sắp xếp</label>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">Mặc định</option>
                                        <option value="viewsCount">Lượt xem từ cao đến thấp</option>
                                        <option value="applicationCount">Lượt ứng tuyển từ cao đến thấp</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
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
                        {filteredJobs.length === 0 ? (
                            <div className="bg-white rounded-xl p-12 text-center shadow-sm animate-fade-in-up">
                                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <FaBriefcase className="text-blue-600 text-3xl" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy công việc phù hợp</h3>
                                <p className="text-gray-600 mb-8">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc</p>
                                <button
                                    onClick={clearFilters}
                                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 hover:scale-105"
                                >
                                    Xem tất cả công việc
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {filteredJobs.map((job, index) => (
                                    <div 
                                        key={job.jobId} 
                                        className="group bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105 border border-gray-100 animate-fade-in-up hover-lift cursor-pointer flex flex-col"
                                        style={{ animationDelay: `${index * 100}ms` }}
                                        onClick={() => handleJobClick(job.jobId)}
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center">
                                                        <FaBriefcase className="text-white text-xl" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">
                                                            {job.title}
                                                        </h3>
                                                        {job.recruiter && (
                                                            <p className="text-sm text-gray-500 flex items-center gap-1">
                                                                <FaBuilding className="text-blue-500" />
                                                                {job.recruiter.firstName} {job.recruiter.lastName}
                                                            </p>
                                                        )}
                                                    </div>
                                                    {job.isFeatured && (
                                                        <div className="flex items-center gap-1 text-yellow-500">
                                                            <FaStar />
                                                            <span className="text-xs font-medium">{t('jobListing.labels.featured')}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                <div className="space-y-2 mb-4">
                                                    {job.description && (
                                                        <p className="text-sm text-gray-600 line-clamp-2">{job.description}</p>
                                                    )}
                                                    
                                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                                        <div className="flex items-center gap-1">
                                                            <FaMapMarkerAlt className="text-blue-500" />
                                                            <span>
                                                                {typeof job.location === 'object'
                                                                    ? `${job.location.province}, ${job.location.district}`
                                                                    : job.location}
                                                            </span>
                                                        </div>
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
                                                            <span>{t('jobListing.metrics.quantity', { count: job.quantity })}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <FaEye className="text-blue-500" />
                                                            <span>{t('jobListing.metrics.views', { count: job.viewsCount || 0 })}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <FaUsers className="text-green-500" />
                                                            <span>{t('jobListing.metrics.applications', { count: job.applicationCount || 0 })}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                            <div className="flex items-center gap-2">
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
                                            
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <FaCalendarAlt />
                                                <span>{t('jobListing.labels.expiresAt', { date: formatDate(job.expiredAt) })}</span>
                                                {job.createdAt && (
                                                    <>
                                                        <FaClock />
                                                        <span>{getTimeAgo(job.createdAt)}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* Pagination */}
                {!isLoading && filteredJobs.length > 0 && (
                    <div className="flex justify-center mt-8 gap-2">
                        <button
                            className="px-3 py-1 rounded border bg-white hover:bg-blue-50 disabled:opacity-50"
                            onClick={() => setPage(page - 1)}
                            disabled={page === 0}
                        >
                            {t('jobListing.pagination.prev')}
                        </button>
                        {[...Array(totalPages)].map((_, idx) => (
                            <button
                                key={idx}
                                className={`px-3 py-1 rounded border ${page === idx ? "bg-blue-600 text-white" : "bg-white hover:bg-blue-50"}`}
                                onClick={() => setPage(idx)}
                            >
                                {idx + 1}
                            </button>
                        ))}
                        <button
                            className="px-3 py-1 rounded border bg-white hover:bg-blue-50 disabled:opacity-50"
                            onClick={() => setPage(page + 1)}
                            disabled={page === totalPages - 1}
                        >
                            {t('jobListing.pagination.next')}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default JobListingPage;