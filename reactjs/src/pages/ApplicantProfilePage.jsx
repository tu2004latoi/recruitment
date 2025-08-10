import React, { useEffect, useState, useContext } from "react";
import { authApis, endpoints } from "../configs/Apis";
import { MyUserContext } from "../configs/MyContexts";
import { useNavigate } from "react-router";
import { FaUser, FaEnvelope, FaPhone, FaBirthdayCake, FaMapMarkerAlt, FaEdit } from "react-icons/fa";

const ApplicantProfilePage = () => {
    const [profile, setProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const user = useContext(MyUserContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate("/login");
            return;
        }
        fetchProfile();
        // eslint-disable-next-line
    }, [user]);

    const fetchProfile = async () => {
        setIsLoading(true);
        try {
            // Truyền userId vào endpoint applicantDetail
            const userId = user?.userId;
            const res = await authApis().get(endpoints.applicantDetail(userId));
            console.log("Profile data:", res.data);
            setProfile(res.data);
        } catch (err) {
            alert("Không thể tải thông tin cá nhân!");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-gray-500">Không tìm thấy thông tin cá nhân.</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
            <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
                <div className="flex items-center gap-6 mb-8">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-4xl shadow">
                        {/* Hiển thị avatar nếu có */}
                        {profile.avatar ? (
                            <img
                                src={profile.user.avatar}
                                alt="avatar"
                                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow"
                            />
                        ) : (
                            <FaUser />
                        )}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-1">
                            {profile.user.firstName} {profile.user.lastName}
                        </h2>
                        <div className="flex items-center gap-2 text-gray-600">
                            <FaEnvelope /> <span>{profile.user.email}</span>
                        </div>
                        {profile.phone && (
                            <div className="flex items-center gap-2 text-gray-600 mt-1">
                                <FaPhone /> <span>{profile.user.phone}</span>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => navigate("/applicant/profile/edit")}
                        className="ml-auto bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
                    >
                        <FaEdit /> Chỉnh sửa
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <div className="mb-4">
                            <span className="block text-gray-500 text-sm mb-1">Ngày sinh</span>
                            <div className="flex items-center gap-2 text-gray-700">
                                <FaBirthdayCake />
                                <span>{profile.dob ? new Date(profile.dob).toLocaleDateString('vi-VN') : "Chưa cập nhật"}</span>
                            </div>
                        </div>
                        <div className="mb-4">
                            <span className="block text-gray-500 text-sm mb-1">Địa chỉ</span>
                            <div className="flex items-center gap-2 text-gray-700">
                                <FaMapMarkerAlt />
                                <span>
                                    {/* Ưu tiên location nếu có */}
                                    {profile.location && typeof profile.location === "object"
                                        ? [
                                            profile.location.province,
                                            profile.location.district,
                                            profile.location.address
                                        ].filter(Boolean).join(", ")
                                        : (profile.address || "Chưa cập nhật")}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className="mb-4">
                            <span className="block text-gray-500 text-sm mb-1">Giới tính</span>
                            <span className="text-gray-700">{profile.gender || "Chưa cập nhật"}</span>
                        </div>
                        <div className="mb-4">
                            <span className="block text-gray-500 text-sm mb-1">Giới thiệu bản thân</span>
                            <span className="text-gray-700">{profile.bio || "Chưa cập nhật"}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApplicantProfilePage;
