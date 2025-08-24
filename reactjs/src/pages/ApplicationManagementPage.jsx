import React, { useEffect, useState, useContext } from "react";
import { authApis, endpoints } from "../configs/Apis";
import { useNavigate } from "react-router-dom";
import { 
    FaBriefcase, 
    FaArrowLeft, 
    FaCalendarAlt, 
    FaBuilding, 
    FaMapMarkerAlt, 
    FaMoneyBillWave,
    FaEye,
    FaCheckCircle,
    FaClock,
    FaTimesCircle,
    FaFileAlt,
    FaUser,
    FaTrash
} from "react-icons/fa";
import { MyUserContext } from "../configs/MyContexts";

const ApplicationManagementPage = () => {
    const [applications, setApplications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const navigate = useNavigate();
    const user = useContext(MyUserContext);

    useEffect(() => {
        if (!user) {
            navigate("/login");
            return;
        }
        fetchApplications();
    }, [user]);

    const fetchApplications = async () => {
        setIsLoading(true);
        try {
            const response = await authApis().get(endpoints.myApplications);
            const applications = response.data;
            
            // Fetch detailed information for each application using separate APIs
            const recruiterCache = {};
            const detailedApplications = await Promise.all(
                applications.map(async (application) => {
                    try {
                        // Fetch job details using jobId
                        const jobResponse = await authApis().get(endpoints.jobDetail(application.jobId));
                        const jobData = jobResponse.data;
                        // Fetch recruiter using nested user.userId from job payload
                        let recruiterData = null;
                        const uid = jobData?.user?.userId;
                        if (uid) {
                            try {
                                if (recruiterCache[uid]) {
                                    recruiterData = recruiterCache[uid];
                                } else {
                                    const recRes = await authApis().get(endpoints.recruiterDetail(uid));
                                    recruiterData = recRes.data;
                                    recruiterCache[uid] = recruiterData;
                                }
                            } catch (e) {
                                console.warn('Failed to fetch recruiter detail for userId', uid, e);
                            }
                        }
                        
                        // Combine all data (userId is the current user, no need to fetch)
                        const detailedApplication = {
                            ...application,
                            job: recruiterData ? { ...jobData, recruiter: recruiterData } : jobData
                        };
                        
                        return detailedApplication;
                    } catch (err) {
                        console.error(`Lỗi khi tải chi tiết đơn ${application.applicationId}:`, err);
                        return application; // Return original if detail fetch fails
                    }
                })
            );
            
            setApplications(detailedApplications);
        } catch (err) {
            console.error("Không thể tải danh sách đơn ứng tuyển:", err);
            alert("Không thể tải danh sách đơn ứng tuyển!");
        } finally {
            setIsLoading(false);
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

    const getStatusBadge = (status) => {
        const statusConfig = {
            'PENDING': { color: 'bg-yellow-100 text-yellow-800', icon: FaClock, text: 'Chờ xử lý' },
            'ACCEPTED': { color: 'bg-green-100 text-green-800', icon: FaCheckCircle, text: 'Đã chấp nhận' },
            'REJECTED': { color: 'bg-red-100 text-red-800', icon: FaTimesCircle, text: 'Đã từ chối' },
            'INTERVIEW': { color: 'bg-blue-100 text-blue-800', icon: FaUser, text: 'Phỏng vấn' }
        };

        const config = statusConfig[status] || statusConfig['PENDING'];
        const IconComponent = config.icon;

        return (
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
                <IconComponent className="w-4 h-4" />
                {config.text}
            </span>
        );
    };

    const handleViewDetail = async (application) => {
        try {
            // Fetch job details using jobId
            const jobResponse = await authApis().get(endpoints.jobDetail(application.jobId));
            const jobData = jobResponse.data;
            // Fetch recruiter using nested user.userId from job payload
            let recruiterData = null;
            const uid = jobData?.user?.userId;
            if (uid) {
                try {
                    const recRes = await authApis().get(endpoints.recruiterDetail(uid));
                    recruiterData = recRes.data;
                } catch (e) {
                    console.warn('Failed to fetch recruiter detail for userId', uid, e);
                }
            }
            
            // Combine all data (userId is the current user, no need to fetch)
            const detailedApplication = {
                ...application,
                job: recruiterData ? { ...jobData, recruiter: recruiterData } : jobData
            };
            
            setSelectedApplication(detailedApplication);
            setShowDetailModal(true);
        } catch (err) {
            console.error("Lỗi khi tải chi tiết đơn ứng tuyển:", err);
            alert("Không thể tải chi tiết đơn ứng tuyển!");
        }
    };

    const handleDeleteApplication = async (application) => {
        // Không cho phép xóa nếu đã được chấp nhận
        if (application?.status === 'ACCEPTED') {
            alert('Đơn ứng tuyển đã được chấp nhận và không thể xóa.');
            return;
        }
        const confirmed = window.confirm("Bạn có chắc chắn muốn xóa đơn ứng tuyển này?");
        if (!confirmed) return;
        try {
            setDeletingId(application.applicationId);
            await authApis().delete(endpoints.deleteApplication(application.applicationId));
            setApplications((prev) => prev.filter(a => a.applicationId !== application.applicationId));
            // Nếu đang mở modal của đơn bị xóa thì đóng modal
            if (selectedApplication && selectedApplication.applicationId === application.applicationId) {
                setShowDetailModal(false);
                setSelectedApplication(null);
            }
            alert("Đã xóa đơn ứng tuyển thành công!");
        } catch (err) {
            console.error("Xóa đơn ứng tuyển thất bại:", err);
            alert("Không thể xóa đơn ứng tuyển. Vui lòng thử lại!");
        } finally {
            setDeletingId(null);
        }
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
                            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                                <FaFileAlt className="text-white text-3xl" />
                            </div>
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-2 border-white animate-pulse-slow"></div>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold gradient-text">Quản lý đơn ứng tuyển</h1>
                            <p className="text-gray-600 mt-1">Theo dõi trạng thái các đơn ứng tuyển của bạn</p>
                        </div>
                    </div>
                </div>

                {/* Applications List */}
                <div className="grid gap-6">
                    {applications.length === 0 ? (
                        <div className="bg-white rounded-xl p-8 text-center shadow-sm animate-fade-in-up">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FaFileAlt className="text-gray-400 text-2xl" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có đơn ứng tuyển nào</h3>
                            <p className="text-gray-600 mb-4">Bạn chưa nộp đơn ứng tuyển nào. Hãy tìm việc làm phù hợp và ứng tuyển ngay!</p>
                            <button
                                onClick={() => navigate("/jobs")}
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200"
                            >
                                Tìm việc làm
                            </button>
                        </div>
                    ) : (
                        applications.map((application) => (
                            <div key={application.applicationId} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 animate-fade-in-up">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                                                <FaBriefcase className="text-white text-xl" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                                    {application.job?.title || "Công việc không xác định"}
                                                </h3>
                                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                                    <div className="flex items-center gap-1">
                                                        <FaBuilding className="text-blue-500" />
                                                        <span>{application.job?.recruiter?.companyName || "Công ty không xác định"}</span>
                                                    </div>
                                                    {application.job?.location && (
                                                        <div className="flex items-center gap-1">
                                                            <FaMapMarkerAlt className="text-red-500" />
                                                            <span>
                                                                {typeof application.job.location === 'object' 
                                                                    ? `${application.job.location.province}, ${application.job.location.district}` 
                                                                    : application.job.location}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <FaCalendarAlt className="text-blue-500" />
                                                <span>Ứng tuyển: {formatDate(application.appliedAt)}</span>
                                            </div>
                                            {application.job?.salary && (
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <FaMoneyBillWave className="text-green-500" />
                                                    <span>Lương: {formatSalary(application.job.salary)}</span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <FaFileAlt className="text-purple-500" />
                                                <span>ID: #{application.applicationId}</span>
                                            </div>
                                        </div>

                                        {application.coverLetter && (
                                            <div className="mb-4">
                                                <p className="text-sm text-gray-600 line-clamp-2">
                                                    <strong>Thư xin việc:</strong> {application.coverLetter}
                                                </p>
                                            </div>
                                        )}
                                        
                                        {application.cv && (
                                            <div className="mb-4">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <FaFileAlt className="text-blue-500" />
                                                    <a 
                                                        href={application.cv} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:text-blue-800 underline font-medium"
                                                    >
                                                        Xem CV/Resume
                                                    </a>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col items-end gap-3">
                                        {getStatusBadge(application.status)}
                                        <button
                                            onClick={() => handleViewDetail(application)}
                                            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors duration-200"
                                        >
                                            <FaEye className="w-4 h-4" />
                                            Xem chi tiết
                                        </button>
                                        <button
                                            onClick={() => handleDeleteApplication(application)}
                                            disabled={deletingId === application.applicationId || application.status === 'ACCEPTED'}
                                            title={application.status === 'ACCEPTED' ? 'Đơn đã được chấp nhận, không thể xóa' : ''}
                                            className={`flex items-center gap-2 text-sm font-medium transition-colors duration-200 disabled:opacity-50 ${application.status === 'ACCEPTED' 
                                                ? 'text-gray-400 cursor-not-allowed' 
                                                : 'text-red-600 hover:text-red-700'}`}
                                        >
                                            <FaTrash className="w-4 h-4" />
                                            {deletingId === application.applicationId ? 'Đang xóa...' : 'Xóa đơn'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Application Detail Modal */}
                {showDetailModal && selectedApplication && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-semibold text-gray-900">Chi tiết đơn ứng tuyển</h3>
                                <button
                                    onClick={() => setShowDetailModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <FaTimesCircle className="text-xl" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Job Information */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-900 mb-3">Thông tin công việc</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <span className="font-medium">Vị trí:</span> {selectedApplication.job?.title}
                                        </div>
                                        <div>
                                            <span className="font-medium">Công ty:</span> {selectedApplication.job?.recruiter?.companyName}
                                        </div>
                                        <div>
                                            <span className="font-medium">Địa điểm:</span> 
                                            {typeof selectedApplication.job?.location === 'object' 
                                                ? `${selectedApplication.job.location.province}, ${selectedApplication.job.location.district}` 
                                                : (selectedApplication.job?.location || "Không xác định")}
                                        </div>
                                        <div>
                                            <span className="font-medium">Lương:</span> {formatSalary(selectedApplication.job?.salary)}
                                        </div>
                                    </div>
                                </div>

                                {/* Application Information */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-900 mb-3">Thông tin đơn ứng tuyển</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <span className="font-medium">ID đơn:</span> #{selectedApplication.applicationId}
                                        </div>
                                        <div>
                                            <span className="font-medium">Ngày ứng tuyển:</span> {formatDate(selectedApplication.appliedAt)}
                                        </div>
                                        <div>
                                            <span className="font-medium">Trạng thái:</span> {getStatusBadge(selectedApplication.status)}
                                        </div>
                                    </div>
                                </div>

                                {/* Cover Letter */}
                                {selectedApplication.coverLetter && (
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h4 className="font-semibold text-gray-900 mb-3">Thư xin việc</h4>
                                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                            {selectedApplication.coverLetter}
                                        </p>
                                    </div>
                                )}

                                {/* Resume */}
                                {selectedApplication.cv && (
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h4 className="font-semibold text-gray-900 mb-3">CV/Resume</h4>
                                        <div className="flex items-center gap-2 text-sm">
                                            <FaFileAlt className="w-4 h-4 text-blue-600" />
                                            <a 
                                                href={selectedApplication.cv} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:text-blue-800 underline font-medium"
                                            >
                                                Xem CV/Resume
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end mt-6">
                                <button
                                    onClick={() => setShowDetailModal(false)}
                                    className="bg-gray-200 text-gray-700 py-2 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-all duration-200"
                                >
                                    Đóng
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ApplicationManagementPage; 