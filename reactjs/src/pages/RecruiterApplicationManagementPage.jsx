import React, { useEffect, useState, useContext } from "react";
import dayjs from "dayjs";

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
    FaEnvelope,
    FaCheck,
    FaBan,
    FaSpinner
} from "react-icons/fa";
import { MyUserContext } from "../configs/MyContexts";

const RecruiterApplicationManagementPage = () => {
    // Interview scheduling form component
    const InterviewForm = ({ userId, jobId, applicationId, onSuccess, onCancel }) => {
        const [province, setProvince] = useState("");
        const [district, setDistrict] = useState("");
        const [address, setAddress] = useState("");
        const [notes, setNotes] = useState("");
        const [scheduledAt, setScheduledAt] = useState("");
        const [loading, setLoading] = useState(false);
        const [error, setError] = useState("");

        const handleSubmit = async (e) => {
            e.preventDefault();
            setLoading(true);
            setError("");
            try {
                // 1. Post location
                const locationRes = await authApis().post(endpoints.createLocation, {
                    province,
                    district,
                    address,
                    notes,
                });
                const locationId = locationRes.data.locationId || locationRes.data.id;
                // 2. Post interview
                await authApis().post(endpoints.createInterview, {
                    userId,
                    jobId, // đảm bảo jobId có giá trị
                    locationId,
                    scheduledAt,
                    notes,
                    status: "SCHEDULED",
                });
                // 3. PATCH sent-interview
                if (applicationId) {
                  await authApis().patch(endpoints.sentInterview(applicationId));
                }
                onSuccess && onSuccess();
                alert("Đã gửi lịch phỏng vấn thành công!");
            } catch (err) {
                setError("Gửi lịch phỏng vấn thất bại!");
            } finally {
                setLoading(false);
            }
        };

        return (
            <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow-md space-y-3 max-w-md mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <input
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                        placeholder="Tỉnh/Thành"
                        value={province}
                        onChange={e => setProvince(e.target.value)}
                        required
                    />
                    <input
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                        placeholder="Quận/Huyện"
                        value={district}
                        onChange={e => setDistrict(e.target.value)}
                        required
                    />
                    <input
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition md:col-span-2"
                        placeholder="Địa chỉ cụ thể"
                        value={address}
                        onChange={e => setAddress(e.target.value)}
                        required
                    />
                </div>

                <input
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition w-full"
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={e => setScheduledAt(e.target.value)}
                    required
                />

                <textarea
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition w-full resize-y min-h-[70px]"
                    placeholder="Ghi chú"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                />

                {error && <div className="text-red-600 text-xs font-medium">{error}</div>}

                <div className="flex gap-3 mt-3 justify-end">
                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        disabled={loading}
                    >
                        {loading ? "Đang gửi..." : "Gửi lịch phỏng vấn"}
                    </button>
                    <button
                        type="button"
                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition text-sm"
                        onClick={onCancel}
                    >
                        Huỷ
                    </button>
                </div>
            </form>

        );
    };
    const [applications, setApplications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [interviewingAppId, setInterviewingAppId] = useState(null);
    const [processingApplication, setProcessingApplication] = useState(null);
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
            // Get current user to get user ID
            const userRes = await authApis().get(endpoints.currentUser);
            const userId = userRes.data.userId;

            // Get applications for this user's jobs
            const response = await authApis().get(endpoints.getApplicationsByRecruiter(userId));

            // Fetch user details and job details for each application
            const applicationsWithDetails = await Promise.all(
                response.data.map(async (application) => {
                    try {
                        // Fetch user details using publicUserDetails API
                        const userDetailsRes = await authApis().get(endpoints.publicUserDetails(application.userId));
                        const userDetails = userDetailsRes.data;

                        // Fetch job details using jobDetail API
                        const jobDetailsRes = await authApis().get(endpoints.jobDetail(application.jobId));
                        const jobDetails = jobDetailsRes.data;

                        return {
                            ...application,
                            userDetails: userDetails,
                            jobDetails: jobDetails
                        };
                    } catch (err) {
                        console.error(`Error fetching details for application ${application.applicationId}:`, err);
                        return {
                            ...application,
                            userDetails: null,
                            jobDetails: null
                        };
                    }
                })
            );

            setApplications(applicationsWithDetails);
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

    const handleViewDetail = (application) => {
        setSelectedApplication(application);
        setShowDetailModal(true);
    };

    const handleAcceptApplication = async (application) => {
        const isRejected = application.status === 'REJECTED';
        const confirmMessage = isRejected
            ? "Bạn có chắc chắn muốn chấp nhận lại đơn ứng tuyển đã bị từ chối này? Hành động này sẽ thay đổi trạng thái từ 'Đã từ chối' thành 'Đã chấp nhận'."
            : "Bạn có chắc chắn muốn chấp nhận đơn ứng tuyển này?";

        if (!window.confirm(confirmMessage)) return;

        setProcessingApplication(application.applicationId);
        try {
            // Accept the application
            await authApis().patch(endpoints.acceptedApplications(application.applicationId));

            // Send email using the correct DTO structure
            if (application.userDetails) {
                await authApis().post(endpoints.sendAcceptedMail, {
                    to: application.userDetails.email,
                    applicantName: `${application.userDetails.firstName} ${application.userDetails.lastName}`,
                    title: application.jobDetails?.title || "Công việc"
                });
            }

            const successMessage = isRejected
                ? "Đã chấp nhận lại đơn ứng tuyển đã bị từ chối và gửi email thông báo!"
                : "Đã chấp nhận đơn ứng tuyển và gửi email thông báo!";
            alert(successMessage);
            fetchApplications(); // Refresh the list
        } catch (err) {
            console.error("Lỗi khi chấp nhận đơn ứng tuyển:", err);
            alert("Có lỗi xảy ra khi chấp nhận đơn ứng tuyển!");
        } finally {
            setProcessingApplication(null);
        }
    };

    const handleRejectApplication = async (application) => {
        const isAccepted = application.status === 'ACCEPTED';
        const confirmMessage = isAccepted
            ? "Bạn có chắc chắn muốn từ chối đơn ứng tuyển đã được chấp nhận này? Hành động này sẽ thay đổi trạng thái từ 'Đã chấp nhận' thành 'Đã từ chối'."
            : "Bạn có chắc chắn muốn từ chối đơn ứng tuyển này?";

        if (!window.confirm(confirmMessage)) return;

        setProcessingApplication(application.applicationId);
        try {
            // Reject the application
            await authApis().patch(endpoints.rejectedApplications(application.applicationId));

            const successMessage = isAccepted
                ? "Đã từ chối đơn ứng tuyển đã được chấp nhận!"
                : "Đã từ chối đơn ứng tuyển!";
            alert(successMessage);
            fetchApplications(); // Refresh the list
        } catch (err) {
            console.error("Lỗi khi từ chối đơn ứng tuyển:", err);
            alert("Có lỗi xảy ra khi từ chối đơn ứng tuyển!");
        } finally {
            setProcessingApplication(null);
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
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition"
                        >
                            <FaArrowLeft className="text-xl" />
                        </button>
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <FaEnvelope className="text-white text-3xl" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-blue-900">Quản lý đơn ứng tuyển</h1>
                            <p className="text-gray-600 mt-1">Xem và xử lý các đơn ứng tuyển cho công việc của bạn</p>
                        </div>
                    </div>
                    <span className="text-sm text-gray-500">
                    Tổng: <b>{applications.length}</b>
                </span>
                </div>

                {/* Applications Table */}
                <div className="bg-white shadow rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                            <tr className="bg-gradient-to-r from-blue-50 to-indigo-100 border-b-2 border-blue-200">
                                <th className="px-4 py-3 text-center text-xs font-bold text-blue-700 uppercase tracking-wider">#</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Ứng viên</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Công việc</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-blue-700 uppercase tracking-wider">Ngày ứng tuyển</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-blue-700 uppercase tracking-wider">Trạng thái</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-blue-700 uppercase tracking-wider">Hành động</th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                            {applications.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center">
                                            <FaEnvelope className="text-4xl mb-2 text-gray-300" />
                                            <div>Chưa có đơn ứng tuyển nào</div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                applications.map((application, idx) => (
                                    <tr key={application.applicationId} className="hover:bg-blue-50 transition">
                                        <td className="px-4 py-3 text-center">{idx + 1}</td>
                                        <td className="px-4 py-3">
                                            <div className="font-semibold text-gray-900">
                                                {application.userDetails
                                                    ? `${application.userDetails.firstName} ${application.userDetails.lastName}`
                                                    : `User ID: ${application.userId}`}
                                            </div>
                                            <div className="text-xs text-gray-500">{application.userDetails?.email}</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-gray-800">
                                                {application.jobDetails?.title || `Job ID: ${application.jobId}`}
                                            </div>
                                            <div className="text-xs text-gray-500">#{application.applicationId}</div>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {formatDate(application.appliedAt)}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {getStatusBadge(application.status)}
                                            {application.interviewScheduleSent === true && (
                                                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-green-100 text-green-700 text-xs font-semibold mt-1">
                                                    <FaCheckCircle className="text-green-500" /> Đã gửi lịch PV
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex flex-wrap gap-1 justify-center">
                                                <button
                                                    onClick={() => handleViewDetail(application)}
                                                    className="p-2 border border-blue-200 rounded hover:bg-blue-100 text-blue-600 transition"
                                                    title="Xem chi tiết"
                                                >
                                                    <FaEye />
                                                </button>
                                                {(application.status === 'PENDING' || application.status === 'REJECTED') && (
                                                    <button
                                                        onClick={() => handleAcceptApplication(application)}
                                                        disabled={processingApplication === application.applicationId}
                                                        className="p-2 border border-green-200 rounded hover:bg-green-100 text-green-600 transition disabled:opacity-50"
                                                        title={application.status === 'REJECTED' ? "Chấp nhận lại" : "Chấp nhận"}
                                                    >
                                                        {processingApplication === application.applicationId
                                                            ? <FaSpinner className="animate-spin" />
                                                            : <FaCheck />}
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleRejectApplication(application)}
                                                    disabled={processingApplication === application.applicationId}
                                                    className={`p-2 border rounded transition disabled:opacity-50 ${
                                                        application.status === 'ACCEPTED'
                                                            ? "border-orange-200 hover:bg-orange-100 text-orange-600"
                                                            : "border-red-200 hover:bg-red-100 text-red-600"
                                                    }`}
                                                    title={application.status === 'ACCEPTED' ? "Từ chối (Đã chấp nhận)" : "Từ chối"}
                                                >
                                                    {processingApplication === application.applicationId
                                                        ? <FaSpinner className="animate-spin" />
                                                        : <FaBan />}
                                                </button>
                                                {application.interviewScheduleSent !== true && (
                                                    interviewingAppId === application.applicationId ? (
                                                        <InterviewForm
                                                            userId={application.userId}
                                                            jobId={application.jobId}
                                                            applicationId={application.applicationId}
                                                            onSuccess={() => { setInterviewingAppId(null); fetchApplications(); }}
                                                            onCancel={() => setInterviewingAppId(null)}
                                                        />
                                                    ) : (
                                                        <button
                                                            onClick={() => setInterviewingAppId(application.applicationId)}
                                                            className="p-2 border border-blue-200 rounded hover:bg-blue-100 text-blue-600 transition"
                                                            title="Gửi lịch phỏng vấn"
                                                        >
                                                            <FaCalendarAlt />
                                                        </button>
                                                    )
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Application Detail Modal */}
                {showDetailModal && selectedApplication && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-lg">
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
                                {/* Applicant Information */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-900 mb-3">Thông tin ứng viên</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <span className="font-medium">User ID:</span> {selectedApplication.userId}
                                        </div>
                                        <div>
                                            <span className="font-medium">Họ tên:</span> {selectedApplication.userDetails ?
                                                `${selectedApplication.userDetails.firstName} ${selectedApplication.userDetails.lastName}` :
                                                "Không có thông tin"
                                            }
                                        </div>
                                        <div>
                                            <span className="font-medium">Email:</span> {selectedApplication.userDetails?.email || "Không có"}
                                        </div>
                                        <div>
                                            <span className="font-medium">Vị trí:</span> {selectedApplication.jobDetails?.title || `Job ID: ${selectedApplication.jobId}`}
                                        </div>
                                        <div>
                                            <span className="font-medium">Job ID:</span> {selectedApplication.jobId}
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

                                {/* Action Buttons */}
                                {(selectedApplication.status === 'PENDING' || selectedApplication.status === 'ACCEPTED' || selectedApplication.status === 'REJECTED') && (
                                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                                        {(selectedApplication.status === 'PENDING' || selectedApplication.status === 'REJECTED') && (
                                            <button
                                                onClick={() => {
                                                    handleAcceptApplication(selectedApplication);
                                                    setShowDetailModal(false);
                                                }}
                                                disabled={processingApplication === selectedApplication.applicationId}
                                                className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50"
                                            >
                                                {processingApplication === selectedApplication.applicationId ? (
                                                    <FaSpinner className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <FaCheck className="w-4 h-4" />
                                                )}
                                                {selectedApplication.status === 'REJECTED' ? 'Chấp nhận lại' : 'Chấp nhận'}
                                            </button>
                                        )}
                                        <button
                                            onClick={() => {
                                                handleRejectApplication(selectedApplication);
                                                setShowDetailModal(false);
                                            }}
                                            disabled={processingApplication === selectedApplication.applicationId}
                                            className={`flex-1 flex items-center justify-center gap-2 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 ${selectedApplication.status === 'ACCEPTED'
                                                ? 'bg-orange-500 hover:bg-orange-600'
                                                : 'bg-red-500 hover:bg-red-600'
                                                }`}
                                        >
                                            {processingApplication === selectedApplication.applicationId ? (
                                                <FaSpinner className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <FaBan className="w-4 h-4" />
                                            )}
                                            {selectedApplication.status === 'ACCEPTED' ? 'Từ chối (Đã chấp nhận)' : 'Từ chối'}
                                        </button>
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

export default RecruiterApplicationManagementPage;