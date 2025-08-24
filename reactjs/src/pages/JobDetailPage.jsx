import React, { useEffect, useState, useContext } from "react";
import { authApis, endpoints } from "../configs/Apis";
import { useNavigate, useParams } from "react-router";
import LocationService from "../services/LocationService";
import LocationDisplay from "../components/LocationDisplay";
import { 
    FaBriefcase, 
    FaArrowLeft, 
    FaMapMarkerAlt, 
    FaMoneyBillWave, 
    FaCalendarAlt, 
    FaUsers, 
    FaEye, 
    FaBuilding, 
    FaClock, 
    FaStar, 
    FaUser,
    FaEnvelope,
    FaPhone,
    FaGlobe,
    FaFileAlt,
    FaCheckCircle,
    FaTimesCircle,
    FaShare,
    FaBookmark,
    FaRegBookmark
} from "react-icons/fa";
import { MyUserContext } from "../configs/MyContexts";
import { useTranslation } from 'react-i18next';

const JobDetailPage = () => {
    const { jobId } = useParams();
    const [job, setJob] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isApplying, setIsApplying] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [isCheckingFavorite, setIsCheckingFavorite] = useState(false);
    const [showApplicationForm, setShowApplicationForm] = useState(false);
    const [hasApplied, setHasApplied] = useState(false);
    const [applicationData, setApplicationData] = useState({
        coverLetter: "",
        resume: null
    });
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(null);
    const { t, i18n } = useTranslation();

    useEffect(() => {
        fetchJobDetails();
        incrementViewCountJob();
    }, [jobId]);

    const incrementViewCountJob = async () => {
        try {
            await authApis().patch(endpoints.incrementViewCountJob(jobId));
        } catch (err) {
            console.error("Failed to increment view count:", err);
        }
    };

    // Navigate to chat with recruiter (partnerId from job.user.userId or job.recruiter.userId)
    const handleChat = () => {
        if (!currentUser) {
            navigate("/login");
            return;
        }
        const partnerId = job?.user?.userId || job?.recruiter?.userId;
        if (!partnerId) {
            alert(t('jobDetail.alerts.userNotFound'));
            return;
        }
        navigate(`/chat?partnerId=${partnerId}`);
    };

    useEffect(() => {
        if (currentUser) {
            checkApplicationStatus();
            checkFavoriteStatus();
        }
    }, [currentUser, jobId]);

    const fetchJobDetails = async () => {
        setIsLoading(true);
        try {
            // Fetch job details first
            const jobRes = await authApis().get(endpoints.jobDetail(jobId));
            const job = jobRes.data;
            
            // Check if job is active and approved (for public access)
            if (!job.isActive || job.status !== "APPROVED") {
                alert(t('jobDetail.alerts.notAvailable'));
                navigate("/jobs");
                return;
            }
            
            // Fetch location details if job has locationId
            if (job.locationId) {
                try {
                    const locationRes = await LocationService.getLocationById(job.locationId);
                    job.location = LocationService.formatLocation(locationRes);
                } catch (locationErr) {
                    console.error("Failed to fetch location details:", locationErr);
                    job.location = t('jobDetail.labels.unknown');
                }
            }
            
            setJob(job);
            
            // Try to fetch current user (might fail if not logged in)
            try {
                const userRes = await authApis().get(endpoints["currentUser"]);
                setCurrentUser(userRes.data);
            } catch (userErr) {
                console.log("User not logged in or session expired");
                setCurrentUser(null);
            }
        } catch (err) {
            console.error("Failed to fetch job details:", err);
            alert(t('jobDetail.alerts.loadFailed'));
            navigate("/jobs");
        } finally {
            setIsLoading(false);
        }
    };

    const checkApplicationStatus = async () => {
        if (!currentUser || currentUser.role !== 'APPLICANT') {
            setHasApplied(false);
            return;
        }
        
        try {
            const response = await authApis().get(endpoints.myApplications);
            const userApplications = response.data;
            const hasAppliedToThisJob = userApplications.some(app => app.jobId === parseInt(jobId));
            setHasApplied(hasAppliedToThisJob);
        } catch (err) {
            console.error("Failed to check application status:", err);
            setHasApplied(false);
        }
    };

    const checkFavoriteStatus = async () => {
        if (!currentUser || currentUser.role !== 'APPLICANT') {
            setIsBookmarked(false);
            return;
        }
        
        try {
            const response = await authApis().get(endpoints.myFavorites);
            const favoriteJobs = response.data;
            const isJobFavorited = favoriteJobs.some(fav => fav.jobId === parseInt(jobId));
            setIsBookmarked(isJobFavorited);
        } catch (err) {
            console.error("Failed to check favorite status:", err);
            setIsBookmarked(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const locale = i18n.language === 'vi' ? 'vi-VN' : 'en-US';
        return new Date(dateString).toLocaleDateString(locale);
    };

    const formatSalary = (salary) => {
        const locale = i18n.language === 'vi' ? 'vi-VN' : 'en-US';
        if (!salary) return t('jobDetail.salary.negotiable');
        return new Intl.NumberFormat(locale).format(salary) + " " + t('jobDetail.currency.vnd');
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

    const handleApply = () => {
        if (!currentUser) {
            navigate("/login");
            return;
        }
        
        if (currentUser.role !== 'APPLICANT') {
            alert(t('jobDetail.alerts.onlyApplicantCanApply'));
            return;
        }
        
        if (hasApplied) {
            alert(t('jobDetail.alerts.alreadyApplied'));
            return;
        }
        
        setShowApplicationForm(true);
    };

    const handleApplicationSubmit = async (e) => {
        e.preventDefault();
        setIsApplying(true);
        
        try {
            const formData = new FormData();
            
            // Ensure currentUser and userId exist
            if (!currentUser || !currentUser.userId) {
                alert(t('jobDetail.alerts.userNotFound'));
                return;
            }
            
            formData.append("userId", currentUser.userId.toString());
            formData.append("jobId", jobId.toString());
            
            // Format datetime for LocalDateTime (YYYY-MM-DDTHH:mm:ss) that Spring Boot can parse
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            const localDateTime = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`; // Format: 2025-08-03T15:23:41
            formData.append("appliedAt", localDateTime);
            
            formData.append("coverLetter", applicationData.coverLetter);
            formData.append("status", "PENDING");
            
            // CV/Resume file as the 'file' field
            if (applicationData.resume) {
                formData.append("file", applicationData.resume);
            }

            const response = await authApis().post(endpoints.createApplication, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            console.log("Application submitted successfully:", response.data);
            alert(t('jobDetail.alerts.applicationSent'));
            await authApis().patch(endpoints.incrementViewCountApplication(jobId));
            setShowApplicationForm(false);
            setApplicationData({ coverLetter: "", resume: null });
            setHasApplied(true);
        } catch (err) {
            console.error("Error submitting application:", err);
            if (err.response?.status === 409) {
                alert(t('jobDetail.alerts.alreadyApplied'));
            } else {
                alert(t('jobDetail.alerts.applicationFailed'));
            }
        } finally {
            setIsApplying(false);
        }
    };

    const handleBookmark = async () => {
        if (!currentUser || currentUser.role !== 'APPLICANT') {
            alert(t('jobDetail.alerts.onlyApplicantCanBookmark'));
            return;
        }

        setIsCheckingFavorite(true);
        
        try {
            if (isBookmarked) {
                // Remove from favorites
                const response = await authApis().get(endpoints.myFavorites);
                const favoriteJobs = response.data;
                const favoriteJob = favoriteJobs.find(fav => fav.jobId === parseInt(jobId));
                
                if (favoriteJob) {
                    await authApis().delete(endpoints.deleteFavorite(favoriteJob.favoriteJobId));
                    setIsBookmarked(false);
                    alert(t('jobDetail.alerts.bookmarkRemoved'));
                }
            } else {
                // Add to favorites
                const now = new Date();
                const year = now.getFullYear();
                const month = String(now.getMonth() + 1).padStart(2, '0');
                const day = String(now.getDate()).padStart(2, '0');
                const hours = String(now.getHours()).padStart(2, '0');
                const minutes = String(now.getMinutes()).padStart(2, '0');
                const seconds = String(now.getSeconds()).padStart(2, '0');
                const favoritedAt = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;

                const favoriteData = {
                    jobId: parseInt(jobId),
                    userId: currentUser.userId,
                    favoritedAt: favoritedAt
                };

                await authApis().post(endpoints.addFavorite, favoriteData);
                setIsBookmarked(true);
                alert(t('jobDetail.alerts.bookmarkAdded'));
            }
        } catch (err) {
            console.error("Error interacting with favorites:", err);
            alert(t('jobDetail.alerts.bookmarkFailed'));
        } finally {
            setIsCheckingFavorite(false);
        }
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: job?.title,
                text: t('jobDetail.shareText', { title: job?.title }),
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert(t('jobDetail.alerts.linkCopied'));
        }
    };

    if (isLoading) {
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

    if (!job) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('jobDetail.headers.notFound')}</h1>
                    <button
                        onClick={() => navigate("/jobs")}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                    >
                        {t('jobDetail.buttons.backToList')}
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
                            <h1 className="text-3xl font-bold gradient-text">{t('jobDetail.headers.jobDetail')}</h1>
                            <p className="text-gray-600 mt-1">{t('jobDetail.headers.jobInfo')}</p>
                        </div>
                    </div>
                    
                    <div className="flex gap-2">
                        <button
                            onClick={handleChat}
                            className="p-3 text-gray-600 hover:text-blue-600 hover:bg-white rounded-lg transition-all duration-200"
                            title={t('jobDetail.buttons.chatWithRecruiter') || 'Nhắn tin với nhà tuyển dụng'}
                        >
                            <FaEnvelope className="text-xl" />
                        </button>
                        <button
                            onClick={handleBookmark}
                            disabled={isCheckingFavorite}
                            className="p-3 text-gray-600 hover:text-yellow-500 hover:bg-white rounded-lg transition-all duration-200 disabled:opacity-50"
                            title={currentUser?.role === 'APPLICANT' ? t('jobDetail.buttons.bookmark') : t('jobDetail.buttons.onlyApplicantCanBookmark')}
                        >
                            {isCheckingFavorite ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-500"></div>
                            ) : (
                                isBookmarked ? <FaBookmark className="text-xl text-yellow-500" /> : <FaRegBookmark className="text-xl" />
                            )}
                        </button>
                        <button
                            onClick={handleShare}
                            className="p-3 text-gray-600 hover:text-blue-500 hover:bg-white rounded-lg transition-all duration-200"
                            title={t('jobDetail.buttons.share')}
                        >
                            <FaShare className="text-xl" />
                        </button>
                    </div>
                </div>

                {/* Job Details */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Job Header */}
                        <div className="bg-white rounded-xl p-6 shadow-sm animate-fade-in-up">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center">
                                            <FaBriefcase className="text-white text-xl" />
                                        </div>
                                        <div className="flex-1">
                                            <h2 className="text-2xl font-bold text-gray-900 mb-2">{job.title}</h2>
                                            {job.recruiter && (
                                                <p className="text-lg text-gray-600 flex items-center gap-2">
                                                    <FaBuilding className="text-blue-500" />
                                                    {job.recruiter.firstName} {job.recruiter.lastName}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {job.isFeatured && (
                                        <div className="flex items-center gap-2 text-yellow-500 mb-4">
                                            <FaStar />
                                            <span className="font-medium">{t('jobDetail.labels.featured')}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Job Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                <div className="text-center p-3 bg-blue-50 rounded-lg">
                                    <div className="text-2xl font-bold text-blue-600">{job.quantity}</div>
                                    <div className="text-sm text-gray-600">{t('jobDetail.metrics.quantity')}</div>
                                </div>
                                <div className="text-center p-3 bg-green-50 rounded-lg">
                                    <div className="text-2xl font-bold text-green-600">{job.viewsCount || 0}</div>
                                    <div className="text-sm text-gray-600">{t('jobDetail.metrics.views')}</div>
                                </div>
                                <div className="text-center p-3 bg-purple-50 rounded-lg">
                                    <div className="text-2xl font-bold text-purple-600">{job.applicationCount || 0}</div>
                                    <div className="text-sm text-gray-600">{t('jobDetail.metrics.applications')}</div>
                                </div>
                                <div className="text-center p-3 bg-orange-50 rounded-lg">
                                    <div className="text-2xl font-bold text-orange-600">
                                        {job.createdAt ? getTimeAgo(job.createdAt) : "N/A"}
                                    </div>
                                    <div className="text-sm text-gray-600">{t('jobDetail.metrics.posted')}</div>
                                </div>
                            </div>

                            {/* Job Info */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-gray-600">
                                    <FaMapMarkerAlt className="text-blue-500" />
                                    <span>
                                        {typeof job.location === 'object'
                                            ? `${job.location.province}, ${job.location.district}`
                                            : job.location}
                                    </span>
                                    {/* View on Google Map button */}
                                    {job.location && job.location.getGoogleMapsUrl && (
                                        <a
                                            href={job.location.getGoogleMapsUrl()}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="ml-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium hover:bg-green-200 transition"
                                        >
                                            {t('jobDetail.buttons.viewOnMap')}
                                        </a>
                                    )}
                                    {/* If backend returns googleMapsUrl instead of getGoogleMapsUrl function */}
                                    {job.location && job.location.googleMapsUrl && (
                                        <a
                                            href={job.location.googleMapsUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="ml-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium hover:bg-green-200 transition"
                                        >
                                            {t('jobDetail.buttons.viewOnMap')}
                                        </a>
                                    )}
                                </div>
                                
                                {job.salary && (
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <FaMoneyBillWave className="text-green-500" />
                                        <span>{formatSalary(job.salary)}</span>
                                    </div>
                                )}
                                
                                <div className="flex items-center gap-3 text-gray-600">
                                    <FaCalendarAlt className="text-red-500" />
                                    <span>{t('jobDetail.labels.expiresAt', { date: formatDate(job.expiredAt) })}</span>
                                </div>
                            </div>
                        </div>

                        {/* Job Description */}
                        <div className="bg-white rounded-xl p-6 shadow-sm animate-fade-in-up">
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('jobDetail.sections.jobDescription')}</h3>
                            <div className="prose max-w-none">
                                {job.description ? (
                                    <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                        {job.description}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 italic">{t('jobDetail.labels.noDescription')}</p>
                                )}
                            </div>
                        </div>

                        {/* Job Requirements */}
                        <div className="bg-white rounded-xl p-6 shadow-sm animate-fade-in-up">
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('jobDetail.sections.jobRequirements')}</h3>
                            <div className="space-y-4">
                                {job.level && (
                                    <div className="flex items-center gap-3">
                                        <FaUser className="text-blue-500" />
                                        <span className="text-gray-700">
                                            {t('jobDetail.labels.level')}:
                                            <span className="font-medium">{typeof job.level === 'object' ? job.level.name : job.level}</span>
                                        </span>
                                    </div>
                                )}
                                
                                {job.jobType && (
                                    <div className="flex items-center gap-3">
                                        <FaBriefcase className="text-purple-500" />
                                        <span className="text-gray-700">
                                            {t('jobDetail.labels.jobType')}:
                                            <span className="font-medium">{typeof job.jobType === 'object' ? job.jobType.name : job.jobType}</span>
                                        </span>
                                    </div>
                                )}
                                
                                {job.industry && (
                                    <div className="flex items-center gap-3">
                                        <FaBuilding className="text-orange-500" />
                                        <span className="text-gray-700">
                                            {t('jobDetail.labels.industry')}:
                                            <span className="font-medium">{typeof job.industry === 'object' ? job.industry.name : job.industry}</span>
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Apply Button */}
                        <div className="bg-white rounded-xl p-6 shadow-sm animate-fade-in-up">
                            <div className="text-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    {hasApplied ? t('jobDetail.buttons.alreadyApplied') : t('jobDetail.buttons.applyNow')}
                                </h3>
                                <p className="text-sm text-gray-600">
                                    {hasApplied 
                                        ? t('jobDetail.labels.alreadyApplied')
                                        : t('jobDetail.labels.applyNow')
                                    }
                                </p>
                            </div>
                            
                            {hasApplied ? (
                                <div className="w-full bg-green-100 text-green-700 py-3 px-6 rounded-lg font-semibold text-center border border-green-200">
                                    <div className="flex items-center justify-center gap-2">
                                        <FaCheckCircle className="text-green-600" />
                                        {t('jobDetail.buttons.alreadyApplied')}
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={handleApply}
                                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
                                >
                                    {currentUser ? t('jobDetail.buttons.applyNow') : t('jobDetail.buttons.loginToApply')}
                                </button>
                            )}
                        </div>

                        {/* Recruiter Info */}
                        {job.recruiter && (
                            <div className="bg-white rounded-xl p-6 shadow-sm animate-fade-in-up">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('jobDetail.sections.recruiterInfo')}</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <FaUser className="text-blue-500" />
                                        <span className="text-gray-700">
                                            {job.recruiter.firstName} {job.recruiter.lastName}
                                        </span>
                                    </div>
                                    
                                    {job.recruiter.email && (
                                        <div className="flex items-center gap-3">
                                            <FaEnvelope className="text-green-500" />
                                            <span className="text-gray-700">{job.recruiter.email}</span>
                                        </div>
                                    )}
                                    
                                    {job.recruiter.phone && (
                                        <div className="flex items-center gap-3">
                                            <FaPhone className="text-purple-500" />
                                            <span className="text-gray-700">{job.recruiter.phone}</span>
                                        </div>
                                    )}
                                    <div className="pt-2">
                                        <button
                                            onClick={handleChat}
                                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 transition"
                                        >
                                            {t('jobDetail.buttons.chatWithRecruiter') || 'Nhắn tin với nhà tuyển dụng'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Job Tags */}
                        <div className="bg-white rounded-xl p-6 shadow-sm animate-fade-in-up">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('jobDetail.sections.otherInfo')}</h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <FaClock className="text-blue-500" />
                                    <span className="text-gray-700">{t('jobDetail.tags.postedPrefix')} {getTimeAgo(job.createdAt)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Application Modal */}
                {showApplicationForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-semibold text-gray-900">{t('jobDetail.labels.applyJob')}</h3>
                                <button
                                    onClick={() => setShowApplicationForm(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <FaTimesCircle className="text-xl" />
                                </button>
                            </div>
                            
                            <form onSubmit={handleApplicationSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('jobDetail.labels.coverLetter')}
                                    </label>
                                    <textarea
                                        value={applicationData.coverLetter}
                                        onChange={(e) => setApplicationData({...applicationData, coverLetter: e.target.value})}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        rows="6"
                                        placeholder={t('jobDetail.placeholders.coverLetter')}
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('jobDetail.labels.resume')}
                                    </label>
                                    <input
                                        type="file"
                                        accept=".pdf,.doc,.docx"
                                        onChange={(e) => setApplicationData({...applicationData, resume: e.target.files[0]})}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1">{t('jobDetail.labels.resumeAccepts')}</p>
                                </div>
                                
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="submit"
                                        disabled={isApplying}
                                        className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50"
                                    >
                                        {isApplying ? t('jobDetail.buttons.submitting') : t('jobDetail.buttons.submit')}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowApplicationForm(false)}
                                        className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-all duration-200"
                                    >
                                        {t('jobDetail.buttons.cancel')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default JobDetailPage;