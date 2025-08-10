import React, { useState, useEffect } from "react";
import Apis, { authApis, endpoints } from "../configs/Apis";
import { FaUserPlus, FaTrash, FaCamera } from "react-icons/fa";
import { getMessaging, onMessage } from "firebase/messaging";
import { initializeApp } from "firebase/app";
import { onMessageListener } from '../firebase';
import { messaging } from '../firebase';

const AddUserPage = () => {
  const [user, setUser] = useState({
    username: "",
    password: "",
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    role: "",
    provider: "LOCAL",
    providerId: "",
  });
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);

  const [applicant, setApplicant] = useState({
    dob: "",
    gender: "MALE",
    experienceYears: 0,
    skills: "",
    jobTitle: "",
    bio: "",
  });

  // Thêm state cho location của applicant
  const [applicantLocation, setApplicantLocation] = useState({
    province: "",
    district: "",
    address: "",
    notes: ""
  });

  const [educations, setEducations] = useState([
    { title: "", year: "", institutionId: "", levelId: "" }
  ]);

  const [recruiter, setRecruiter] = useState({
    companyName: "",
    bio: "",
    companyWebsite: "",
    position: "",
    logoUrl: "",
  });

  // Thêm state cho location của recruiter
  const [recruiterLocation, setRecruiterLocation] = useState({
    province: "",
    district: "",
    address: "",
    notes: ""
  });

  const [institutions, setInstitutions] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("Viet Nam");
  const [institutionSearch, setInstitutionSearch] = useState("");
  const [levels, setLevels] = useState([]);

  useEffect(() => {
    fetch("https://raw.githubusercontent.com/Hipo/university-domains-list/master/world_universities_and_domains.json")
      .then(res => res.json())
      .then(data => setInstitutions(data));
    // Lấy levels từ API
    authApis().get(endpoints.levels)
      .then(res => setLevels(res.data));
  }, []);

  useEffect(() => {
    if (Notification.permission === "granted") {
      onMessage(messaging, (payload) => {
        if (payload && payload.notification) {
          navigator.serviceWorker.getRegistration().then(reg => {
            if (reg) {
              const { title, body } = payload.notification;
              reg.showNotification(title, {
                body,
                icon: '/logo192.png',
              });
            }
          });
        }
      });
    }
  }, []);

  const countryList = Array.from(
    new Set(institutions.map(inst => inst.country).filter(Boolean))
  ).sort();

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleApplicantChange = (e) => {
    setApplicant({ ...applicant, [e.target.name]: e.target.value });
  };

  // Handler cho location của applicant
  const handleApplicantLocationChange = (field, value) => {
    setApplicantLocation({ ...applicantLocation, [field]: value });
  };

  const handleEducationChange = (idx, e) => {
    const updated = [...educations];
    updated[idx][e.target.name] = e.target.value;
    setEducations(updated);
  };

  const addEducation = () => {
    setEducations([
      ...educations,
      { title: "", year: "", institutionId: "", levelId: "" },
    ]);
  };

  const removeEducation = (idx) => {
    const updated = educations.filter((_, i) => i !== idx);
    setEducations(updated);
  };

  const handleRecruiterChange = (e) => {
    setRecruiter({ ...recruiter, [e.target.name]: e.target.value });
  };

  // Handler cho location của recruiter
  const handleRecruiterLocationChange = (field, value) => {
    setRecruiterLocation({ ...recruiterLocation, [field]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      for (const key in user) {
        formData.append(key, user[key]);
      }
      if (file) formData.append("file", file);

      const res = await authApis().post(endpoints.createUser, formData);
      const userId = res.data.userId || res.data.id;

      let applicantLocationId = null;
      let recruiterLocationId = null;

      if (user.role === "APPLICANT" &&
        applicantLocation.province &&
        applicantLocation.district &&
        applicantLocation.address) {
        try {
          const locationData = {
            ...applicantLocation,
            userId
          };
          const locationResponse = await authApis().post(endpoints.createLocation, locationData);
          applicantLocationId = locationResponse.data.locationId || locationResponse.data.id;
          console.log("Created applicant location:", applicantLocationId);
        } catch (error) {
          alert("Tạo địa chỉ cho ứng viên thất bại: " + error.message);
          return;
        }
      }

      if (user.role === "RECRUITER" &&
        recruiterLocation.province &&
        recruiterLocation.district &&
        recruiterLocation.address) {
        try {
          const locationData = {
            ...recruiterLocation,
            userId
          };
          const locationResponse = await authApis().post(endpoints.createLocation, locationData);
          recruiterLocationId = locationResponse.data.locationId || locationResponse.data.id;
          console.log("Created recruiter location:", recruiterLocationId);
        } catch (error) {
          alert("Tạo địa chỉ cho nhà tuyển dụng thất bại: " + error.message);
          return;
        }
      }

      if (user.role === "ADMIN") {
        await authApis().post(endpoints.createAdmin, { userId });
      } else if (user.role === "MODERATOR") {
        const moderatorData = {
          userId: userId,
          createdAt: new Date().toISOString()
        };
        await authApis().post(endpoints.createModerator, moderatorData);
      } else if (user.role === "RECRUITER") {
        const recruiterData = {
          userId,
          ...recruiter,
          locationId: recruiterLocationId, // Sử dụng locationId đã tạo
        };
        console.log("Creating recruiter with data:", recruiterData);
        await authApis().post(endpoints.createRecruiter, recruiterData);
      } else if (user.role === "APPLICANT") {
        const applicantData = {
          ...applicant,
          userId,
          locationId: applicantLocationId, // Sử dụng locationId đã tạo
        };
        console.log("Creating applicant with data:", applicantData);
        const applicantRes = await authApis().post(endpoints.createApplicant, applicantData);
        const applicantId = applicantRes.data.userId || applicantRes.data.id || userId;

        const educationsWithIds = [];
        for (const edu of educations) {
          let institutionId = edu.institutionId;
          if (!institutionId || isNaN(Number(institutionId))) {
            const inst = institutions.find(inst => inst.name === edu.institutionId || inst.name === edu.institutionName);
            if (inst) {
              // Kiểm tra xem institution đã tồn tại trong database chưa
              try {
                const existingInstitutions = await authApis().get(endpoints.institutions);
                const existingInst = existingInstitutions.data.find(existing => {
                  const existingName = existing.name.toLowerCase().trim();
                  const instName = inst.name.toLowerCase().trim();
                  return existingName === instName ||
                    existingName.includes(instName) ||
                    instName.includes(existingName);
                });

                if (existingInst) {
                  // Sử dụng institution đã tồn tại
                  institutionId = existingInst.id || existingInst.institutionId;
                  console.log("Using existing institution:", existingInst.name, "ID:", institutionId);
                } else {
                  // Tạo institution mới
                  const res = await authApis().post(endpoints.addInstitution, {
                    name: inst.name,
                    country: inst.country,
                    domain: inst.domains?.[0] || "",
                    website: inst.web_pages?.[0] || ""
                  });
                  institutionId = res.data.institutionId || res.data.id;
                  console.log("Created new institution:", inst.name, "ID:", institutionId);
                }
              } catch (err) {
                console.error("Error handling institution:", err);
                continue;
              }
            }
          }
          educationsWithIds.push({
            ...edu,
            userId: applicantId,
            institutionId: Number(institutionId),
            levelId: Number(edu.levelId)
          });
        }
        // Chỉ gửi những education có đủ thông tin
        const validEducations = educationsWithIds.filter(edu =>
          edu.title && edu.year && edu.institutionId && edu.levelId
        );

        if (validEducations.length > 0) {
          await authApis().post(endpoints.createEducation, validEducations);
        }
      }

      // Sau khi thêm user thành công, gửi notification qua backend
      try {
        const fcmToken = localStorage.getItem("fcmToken"); // hoặc lấy từ state nếu bạn lưu ở đó
        console.log(fcmToken);
        if (fcmToken) {
          await authApis().post(endpoints.sendNotification, {
            title: "Thông báo",
            body: "Thêm người dùng thành công!",
            fcmToken: fcmToken
          });
          alert("Thêm người dùng thành công và đã gửi thông báo!");
        } else {
          alert("Thêm người dùng thành công! (Không tìm thấy FCM token để gửi thông báo)");
        }
      } catch (err) {
        alert("Thêm thành công nhưng gửi thông báo thất bại!");
      }
    } catch (err) {
      console.error(err);
      alert("Thêm thất bại.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8 bg-gradient-to-br from-blue-100 via-white to-blue-50 rounded-3xl shadow-2xl border border-blue-200 animate-fade-in">
      <h1 className="flex items-center justify-center gap-3 text-4xl font-extrabold mb-10 text-blue-800 text-center tracking-wide drop-shadow-lg">
        <FaUserPlus className="text-blue-500" /> Thêm Người Dùng
      </h1>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Username */}
          <div>
            <label className="block mb-1 font-semibold text-gray-600 text-sm">Username</label>
            <input className="w-full border-2 border-blue-200 rounded-xl px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-sm transition-all duration-200 bg-white" placeholder="Username" name="username" onChange={handleChange} required />
          </div>
          {/* Password */}
          <div>
            <label className="block mb-1 font-semibold text-gray-600 text-sm">Password</label>
            <input className="w-full border-2 border-blue-200 rounded-xl px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-sm transition-all duration-200 bg-white" placeholder="Password" type="password" name="password" onChange={handleChange} required />
          </div>
          {/* Email */}
          <div>
            <label className="block mb-1 font-semibold text-gray-600 text-sm">Email</label>
            <input className="w-full border-2 border-blue-200 rounded-xl px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-sm transition-all duration-200 bg-white" placeholder="Email" name="email" onChange={handleChange} />
          </div>
          {/* First Name */}
          <div>
            <label className="block mb-1 font-semibold text-gray-600 text-sm">First Name</label>
            <input className="w-full border-2 border-blue-200 rounded-xl px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-sm transition-all duration-200 bg-white" placeholder="First Name" name="firstName" onChange={handleChange} />
          </div>
          {/* Last Name */}
          <div>
            <label className="block mb-1 font-semibold text-gray-600 text-sm">Last Name</label>
            <input className="w-full border-2 border-blue-200 rounded-xl px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-sm transition-all duration-200 bg-white" placeholder="Last Name" name="lastName" onChange={handleChange} />
          </div>
          {/* Phone */}
          <div>
            <label className="block mb-1 font-semibold text-gray-600 text-sm">Phone</label>
            <input className="w-full border-2 border-blue-200 rounded-xl px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-sm transition-all duration-200 bg-white" placeholder="Phone" name="phone" onChange={handleChange} />
          </div>
          {/* Role */}
          <div>
            <label className="block mb-1 font-semibold text-gray-600 text-sm">Vai trò</label>
            <select className="w-full border-2 border-blue-200 rounded-xl px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-sm transition-all duration-200 bg-white" name="role" onChange={handleChange} required>
              <option value="">-- Chọn Vai Trò --</option>
              <option value="ADMIN">ADMIN</option>
              <option value="MODERATOR">MODERATOR</option>
              <option value="RECRUITER">RECRUITER</option>
              <option value="APPLICANT">APPLICANT</option>
            </select>
          </div>
          {/* Provider */}
          <div>
            <label className="block mb-1 font-semibold text-gray-600 text-sm">Provider</label>
            <select
              className="w-full border-2 border-blue-200 rounded-xl px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-sm transition-all duration-200 bg-white"
              name="provider"
              value={user.provider}
              onChange={handleChange}
              required
            >
              <option value="LOCAL">LOCAL</option>
              <option value="GOOGLE">GOOGLE</option>
            </select>
          </div>
          {/* Provider ID */}
          {user.provider === "GOOGLE" && (
            <div>
              <label className="block mb-1 font-semibold text-gray-600 text-sm">Provider ID</label>
              <input
                className="w-full border-2 border-blue-200 rounded-xl px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-sm transition-all duration-200 bg-white"
                placeholder="Provider ID"
                name="providerId"
                onChange={handleChange}
                value={user.providerId}
                required
              />
            </div>
          )}
          {/* Avatar/File */}
          <div className="flex flex-col items-center justify-center gap-2">
            <label className="block mb-1 font-semibold text-gray-600 text-sm">Avatar/File</label>
            <div className="relative group">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  setFile(e.target.files[0]);
                  if (e.target.files[0]) setFilePreview(URL.createObjectURL(e.target.files[0]));
                  else setFilePreview(null);
                }}
                className="absolute opacity-0 w-24 h-24 cursor-pointer z-10"
              />
              <div className="w-24 h-24 rounded-full border-4 border-blue-200 bg-white flex items-center justify-center shadow-lg group-hover:border-blue-400 transition-all duration-200 cursor-pointer relative overflow-hidden">
                {filePreview ? (
                  <img src={filePreview} alt="Preview" className="w-full h-full object-cover rounded-full" />
                ) : (
                  <FaCamera className="text-3xl text-blue-300" />
                )}
                <div className="absolute bottom-0 left-0 w-full bg-blue-500 bg-opacity-70 text-white text-xs text-center py-1 opacity-0 group-hover:opacity-100 transition-all duration-200">Chọn ảnh</div>
              </div>
            </div>
          </div>
        </div>
        {/* Applicant section */}
        {user.role === "APPLICANT" && (
          <div className="border-t pt-8 mt-10">
            <h2 className="text-2xl font-bold text-blue-700 mb-6 flex items-center gap-2">Thông Tin Ứng Viên</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block mb-1 font-semibold text-gray-600 text-sm">Ngày sinh</label>
                <input type="date" name="dob" onChange={handleApplicantChange} className="w-full border-2 border-blue-200 rounded-xl px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-sm transition-all duration-200 bg-white" />
              </div>
              <div>
                <label className="block mb-1 font-semibold text-gray-600 text-sm">Giới tính</label>
                <select name="gender" onChange={handleApplicantChange} className="w-full border-2 border-blue-200 rounded-xl px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-sm transition-all duration-200 bg-white">
                  <option value="MALE">Nam</option>
                  <option value="FEMALE">Nữ</option>
                </select>
              </div>
              <div>
                <label className="block mb-1 font-semibold text-gray-600 text-sm">Số năm kinh nghiệm</label>
                <input name="experienceYears" type="number" placeholder="Số năm kinh nghiệm" onChange={handleApplicantChange} className="w-full border-2 border-blue-200 rounded-xl px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-sm transition-all duration-200 bg-white" />
              </div>
              <div>
                <label className="block mb-1 font-semibold text-gray-600 text-sm">Vị trí mong muốn</label>
                <input name="jobTitle" placeholder="Vị trí mong muốn" onChange={handleApplicantChange} className="w-full border-2 border-blue-200 rounded-xl px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-sm transition-all duration-200 bg-white" />
              </div>
              <div className="md:col-span-2">
                <label className="block mb-1 font-semibold text-gray-600 text-sm">Kỹ năng</label>
                <textarea name="skills" placeholder="Kỹ năng" onChange={handleApplicantChange} className="w-full border-2 border-blue-200 rounded-xl px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-sm transition-all duration-200 bg-white" />
              </div>
              <div className="md:col-span-2">
                <label className="block mb-1 font-semibold text-gray-600 text-sm">Giới thiệu bản thân</label>
                <textarea name="bio" placeholder="Giới thiệu bản thân" onChange={handleApplicantChange} className="w-full border-2 border-blue-200 rounded-xl px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-sm transition-all duration-200 bg-white" />
              </div>
            </div>

            {/* Location fields cho applicant */}
            <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <h4 className="font-medium text-gray-900 mb-3">Thông tin địa chỉ</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tỉnh/Thành phố</label>
                  <input
                    type="text"
                    value={applicantLocation.province}
                    onChange={(e) => handleApplicantLocationChange('province', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Ví dụ: Hà Nội"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quận/Huyện</label>
                  <input
                    type="text"
                    value={applicantLocation.district}
                    onChange={(e) => handleApplicantLocationChange('district', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Ví dụ: Cầu Giấy"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ chi tiết</label>
                  <input
                    type="text"
                    value={applicantLocation.address}
                    onChange={(e) => handleApplicantLocationChange('address', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Ví dụ: 123 Đường ABC"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                  <textarea
                    value={applicantLocation.notes}
                    onChange={(e) => handleApplicantLocationChange('notes', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Ghi chú về địa chỉ (tùy chọn)"
                    rows="3"
                  />
                </div>
              </div>
            </div>

            <h3 className="font-medium mt-8 mb-3 text-blue-600 text-lg flex items-center gap-2">Học vấn</h3>
            <div className="space-y-4">
              {/* Chọn quốc gia và tìm kiếm trường */}
              <div className="mb-2">
                <label className="block text-sm font-semibold text-gray-600 mb-1">Quốc gia</label>
                <select
                  value={selectedCountry}
                  onChange={e => setSelectedCountry(e.target.value)}
                  className="w-full border border-blue-200 rounded-lg px-3 py-2"
                >
                  {countryList.map((country, i) => (
                    <option key={i} value={country}>{country}</option>
                  ))}
                </select>
              </div>
              <div className="mb-2">
                <input
                  type="text"
                  placeholder="Tìm kiếm trường..."
                  value={institutionSearch}
                  onChange={e => setInstitutionSearch(e.target.value)}
                  className="w-full border border-blue-200 rounded-lg px-3 py-2"
                />
              </div>
              {educations.map((edu, idx) => (
                <div key={idx} className="relative grid grid-cols-2 gap-4 border-2 border-blue-100 p-4 rounded-2xl bg-white shadow-md hover:shadow-xl transition-all duration-200 animate-fade-in">
                  <input name="title" placeholder="Tên bằng cấp" value={edu.title} onChange={(e) => handleEducationChange(idx, e)} className="w-full border border-blue-200 rounded-lg px-3 py-2 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200" />
                  <input name="year" type="number" placeholder="Năm" value={edu.year} onChange={(e) => handleEducationChange(idx, e)} className="w-full border border-blue-200 rounded-lg px-3 py-2 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200" />
                  <select
                    name="institutionId"
                    value={edu.institutionId}
                    onChange={e => handleEducationChange(idx, e)}
                    className="w-full border border-blue-200 rounded-lg px-3 py-2 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200"
                  >
                    <option value="">-- Chọn trường --</option>
                    {institutions
                      .filter(inst =>
                        inst.country === selectedCountry &&
                        inst.name.toLowerCase().includes(institutionSearch.toLowerCase())
                      )
                      .map((inst, i) => (
                        <option key={i} value={inst.name}>{inst.name}</option>
                      ))}
                  </select>
                  <select
                    name="levelId"
                    value={edu.levelId}
                    onChange={e => handleEducationChange(idx, e)}
                    className="w-full border border-blue-200 rounded-lg px-3 py-2 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200"
                  >
                    <option value="">-- Chọn bậc học --</option>
                    {levels.map((level, i) => (
                      <option key={i} value={level.levelId || level.id}>{level.name}</option>
                    ))}
                  </select>
                  {educations.length > 1 && (
                    <button type="button" onClick={() => removeEducation(idx)} className="absolute -top-3 -right-3 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition-all duration-200 z-10" title="Xóa học vấn">
                      <FaTrash />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button type="button" onClick={addEducation} className="flex items-center gap-2 text-blue-700 hover:text-blue-900 font-semibold mt-4 transition-all duration-200">
              <span className="text-xl">+</span> Thêm học vấn
            </button>
          </div>
        )}
        {user.role === "RECRUITER" && (
          <div className="border-t pt-8 mt-10">
            <h2 className="text-2xl font-bold text-blue-700 mb-6">Thông Tin Nhà Tuyển Dụng</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block mb-1 font-semibold text-gray-600 text-sm">Tên công ty</label>
                <input name="companyName" value={recruiter.companyName} onChange={handleRecruiterChange} className="w-full border-2 border-blue-200 rounded-xl px-4 py-2" required />
              </div>
              <div>
                <label className="block mb-1 font-semibold text-gray-600 text-sm">Website công ty</label>
                <input name="companyWebsite" value={recruiter.companyWebsite} onChange={handleRecruiterChange} className="w-full border-2 border-blue-200 rounded-xl px-4 py-2" />
              </div>
              <div>
                <label className="block mb-1 font-semibold text-gray-600 text-sm">Vị trí</label>
                <input name="position" value={recruiter.position} onChange={handleRecruiterChange} className="w-full border-2 border-blue-200 rounded-xl px-4 py-2" />
              </div>
              <div>
                <label className="block mb-1 font-semibold text-gray-600 text-sm">Logo URL</label>
                <input name="logoUrl" value={recruiter.logoUrl} onChange={handleRecruiterChange} className="w-full border-2 border-blue-200 rounded-xl px-4 py-2" />
              </div>
              <div className="md:col-span-2">
                <label className="block mb-1 font-semibold text-gray-600 text-sm">Giới thiệu công ty</label>
                <textarea name="bio" value={recruiter.bio} onChange={handleRecruiterChange} className="w-full border-2 border-blue-200 rounded-xl px-4 py-2" />
              </div>
            </div>

            {/* Location fields cho recruiter */}
            <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <h4 className="font-medium text-gray-900 mb-3">Thông tin địa chỉ</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tỉnh/Thành phố</label>
                  <input
                    type="text"
                    value={recruiterLocation.province}
                    onChange={(e) => handleRecruiterLocationChange('province', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Ví dụ: Hà Nội"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quận/Huyện</label>
                  <input
                    type="text"
                    value={recruiterLocation.district}
                    onChange={(e) => handleRecruiterLocationChange('district', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Ví dụ: Cầu Giấy"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ chi tiết</label>
                  <input
                    type="text"
                    value={recruiterLocation.address}
                    onChange={(e) => handleRecruiterLocationChange('address', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Ví dụ: 123 Đường ABC"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                  <textarea
                    value={recruiterLocation.notes}
                    onChange={(e) => handleRecruiterLocationChange('notes', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Ghi chú về địa chỉ (tùy chọn)"
                    rows="3"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="flex justify-center mt-12">
          <button type="submit" className="bg-gradient-to-r from-blue-600 to-blue-400 text-white px-10 py-4 rounded-2xl font-bold text-xl shadow-xl hover:from-blue-700 hover:to-blue-500 transition-all duration-200 active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-200">
            Thêm Người Dùng
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddUserPage;
