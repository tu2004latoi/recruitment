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
    }, [user]);

    const fetchProfile = async () => {
        setIsLoading(true);
        try {
            const userId = user?.userId;
            const res = await authApis().get(endpoints.applicantDetail(userId));
            setProfile(res.data);
        } catch (err) {
            alert("Không thể tải thông tin cá nhân!");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-gray-500 text-lg">Không tìm thấy thông tin cá nhân.</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
                    <div className="relative w-32 h-32 md:w-36 md:h-36 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-5xl shadow-lg overflow-hidden">
                        {profile.user.avatar ? (
                            <img
                                src={profile.user.avatar}
                                alt="avatar"
                                className="w-full h-full rounded-full object-cover border-4 border-white shadow"
                            />
                        ) : (
                            <FaUser className="text-6xl" />
                        )}
                    </div>
                    <div className="flex-1">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">
                            {profile.user.firstName} {profile.user.lastName}
                        </h2>
                        <div className="flex flex-col gap-2 text-gray-600">
                            <div className="flex items-center gap-2">
                                <FaEnvelope /> <span>{profile.user.email}</span>
                            </div>
                            {profile.user.phone && (
                                <div className="flex items-center gap-2">
                                    <FaPhone /> <span>{profile.user.phone}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={() => navigate("/applicant/profile/edit")}
                        className="mt-4 md:mt-0 ml-auto bg-blue-600 text-white px-5 py-2 rounded-xl flex items-center gap-2 hover:bg-blue-700 transition-all duration-300 shadow"
                    >
                        <FaEdit /> Chỉnh sửa
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-lg shadow-sm flex items-center gap-4">
                            <FaBirthdayCake className="text-blue-500 text-xl" />
                            <div>
                                <span className="block text-gray-500 text-sm">Ngày sinh</span>
                                <span className="text-gray-700 font-medium">
                                    {profile.dob ? new Date(profile.dob).toLocaleDateString('vi-VN') : "Chưa cập nhật"}
                                </span>
                            </div>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-lg shadow-sm flex items-center gap-4">
                            <FaMapMarkerAlt className="text-red-500 text-xl" />
                            <div>
                                <span className="block text-gray-500 text-sm">Địa chỉ</span>
                                <span className="text-gray-700 font-medium">
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

                    <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-lg shadow-sm">
                            <span className="block text-gray-500 text-sm mb-1">Giới tính</span>
                            <span className="text-gray-700 font-medium">{profile.gender || "Chưa cập nhật"}</span>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-lg shadow-sm">
                            <span className="block text-gray-500 text-sm mb-1">Giới thiệu bản thân</span>
                            <span className="text-gray-700 font-medium">{profile.bio || "Chưa cập nhật"}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApplicantProfilePage;
