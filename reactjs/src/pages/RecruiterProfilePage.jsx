import React, { useEffect, useState, useContext } from "react";
import { authApis, endpoints } from "../configs/Apis";
import { MyUserContext } from "../configs/MyContexts";
import { useNavigate } from "react-router";
import { FaUserTie, FaEnvelope, FaPhone, FaMapMarkerAlt, FaEdit, FaBuilding, FaGlobe } from "react-icons/fa";

const RecruiterProfilePage = () => {
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
            const userId = user?.userId;
            const res = await authApis().get(endpoints.recruiterDetail(userId));
            setProfile(res.data);
        } catch (err) {
            alert("Không thể tải thông tin nhà tuyển dụng!");
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
                <div className="text-gray-500">Không tìm thấy thông tin nhà tuyển dụng.</div>
            </div>
        );
    }

    // Lấy thông tin user từ profile.user
    const recruiterUser = profile.user || {};

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
            <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
                <div className="flex items-center gap-6 mb-8">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-4xl shadow">
                        {profile.logoUrl ? (
                            <img
                                src={profile.logoUrl}
                                alt="logo"
                                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow"
                            />
                        ) : (
                            <FaUserTie />
                        )}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-1">
                            {recruiterUser.firstName} {recruiterUser.lastName}
                        </h2>
                        <div className="flex items-center gap-2 text-gray-600">
                            <FaEnvelope /> <span>{recruiterUser.email}</span>
                        </div>
                        {recruiterUser.phone && (
                            <div className="flex items-center gap-2 text-gray-600 mt-1">
                                <FaPhone /> <span>{recruiterUser.phone}</span>
                            </div>
                        )}
                        {profile.position && (
                            <div className="flex items-center gap-2 text-gray-600 mt-1">
                                <span className="font-medium">{profile.position}</span>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => navigate("/recruiter/profile/edit")}
                        className="ml-auto bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
                    >
                        <FaEdit /> Chỉnh sửa
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <div className="mb-4">
                            <span className="block text-gray-500 text-sm mb-1">Tên công ty</span>
                            <div className="flex items-center gap-2 text-gray-700">
                                <FaBuilding />
                                <span>{profile.companyName || "Chưa cập nhật"}</span>
                            </div>
                        </div>
                        <div className="mb-4">
                            <span className="block text-gray-500 text-sm mb-1">Địa chỉ</span>
                            <div className="flex items-center gap-2 text-gray-700">
                                <FaMapMarkerAlt />
                                <span>
                                    {profile.location && typeof profile.location === "object"
                                        ? [
                                            profile.location.province,
                                            profile.location.district,
                                            profile.location.address
                                        ].filter(Boolean).join(", ")
                                        : "Chưa cập nhật"}
                                </span>
                            </div>
                        </div>
                        {profile.companyWebsite && (
                            <div className="mb-4">
                                <span className="block text-gray-500 text-sm mb-1">Website công ty</span>
                                <div className="flex items-center gap-2 text-blue-700">
                                    <FaGlobe />
                                    <a
                                        href={profile.companyWebsite}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="underline break-all"
                                    >
                                        {profile.companyWebsite}
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                    <div>
                        <div className="mb-4">
                            <span className="block text-gray-500 text-sm mb-1">Giới thiệu công ty</span>
                            <span className="text-gray-700">{profile.bio || "Chưa cập nhật"}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecruiterProfilePage;
