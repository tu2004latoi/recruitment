import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { endpoints, authApis } from "../configs/Apis";
import { FaUserEdit, FaCamera, FaTrash } from "react-icons/fa";

const UpdateUserPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState({
    userId: "",
    password: "",
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    role: "",
    file: null,
  });

  const [recruiter, setRecruiter] = useState({
    companyName: "",
    bio: "",
    companyWebsite: "",
    position: "",
    logoUrl: "",
    locationId: null,
  });

    const [recruiterLocation, setRecruiterLocation] = useState({
      locationId: null,
      province: "",
      district: "",
      address: "",
      notes: ""
    });

  const [applicant, setApplicant] = useState({
    dob: "",
    gender: "MALE",
    experienceYears: 0,
    skills: "",
    jobTitle: "",
    bio: "",
    locationId: null,
  });

  const [applicantLocation, setApplicantLocation] = useState({
    locationId: null,
    province: "",
    district: "",
    address: "",
    notes: ""
  });

  const [educations, setEducations] = useState([
    { educationId: null, title: "", year: "", institutionId: "", levelId: "" }
  ]);
  const [institutionMap, setInstitutionMap] = useState(new Map()); // Map để lưu trữ ID -> tên institution
  const [deletedEducationIds, setDeletedEducationIds] = useState([]);

  const [institutions, setInstitutions] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("Viet Nam");
  const [institutionSearch, setInstitutionSearch] = useState("");
  const [levels, setLevels] = useState([]);

  const [preview, setPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const res = await authApis().get(endpoints.currentUser);
      setUser({
        ...res.data,
        file: null, // file sẽ được cập nhật lại nếu user chọn ảnh mới
      });
      if (res.data.avatar) {
        setPreview(res.data.avatar);
      }
    };
    fetchUser();
  }, []);

  // Fetch levels from API
  useEffect(() => {
    authApis().get(endpoints.levels)
      .then(res => {
        setLevels(res.data);
      })
      .catch(err => console.error("Error fetching levels:", err));
  }, []);

  // Fetch institutions from GitHub API
  useEffect(() => {
    fetch("https://raw.githubusercontent.com/Hipo/university-domains-list/master/world_universities_and_domains.json")
      .then(res => res.json())
      .then(data => setInstitutions(data))
      .catch(err => console.error("Error fetching institutions from GitHub:", err));
  }, []);

  // Load institution map from database
  useEffect(() => {
    const loadInstitutionMap = async () => {
      try {
        const res = await authApis().get(endpoints.institutions);
        const map = new Map();
        res.data.forEach(inst => {
          map.set(inst.id || inst.institutionId, inst.name);
        });
        setInstitutionMap(map);
      } catch (err) {
        console.error("Error loading institution map:", err);
      }
    };
    loadInstitutionMap();
  }, []);

  // Fetch recruiter data if role is RECRUITER
  useEffect(() => {
    const fetchRecruiter = async () => {
      if (user.role === "RECRUITER") {
        try {
          const res = await authApis().get(endpoints.recruiterDetail(userId));
          setRecruiter(res.data);
          const resLocation = await authApis().get(endpoints.locationDetail(res.data.location.locationId));
          setRecruiterLocation({
            locationId: resLocation.data.locationId,
            province: resLocation.data.province,
            district: resLocation.data.district,
            address: resLocation.data.address,
            notes: resLocation.data.notes
          });
        } catch (err) {
          console.error("Error fetching recruiter data:", err);
        }
      }
    };

    if (user.role === "RECRUITER") {
      fetchRecruiter();
    }
  }, [user.role, userId]);

  useEffect(() => {
    console.log("Applicant location updated:", applicantLocation);
  }, [applicantLocation]);

  useEffect(() => {
    console.log("Recruiter location updated:", recruiterLocation);
  }, [recruiterLocation]);

  // Fetch applicant data if role is APPLICANT
  useEffect(() => {
    const fetchApplicant = async () => {
      if (user.role === "APPLICANT") {
        try {
          const res = await authApis().get(endpoints.getApplicantProfile);
          setApplicant(res.data);
          const resLocation = await authApis().get(endpoints.locationDetail(res.data.location.locationId));
          setApplicantLocation({
            locationId: resLocation.data.locationId,
            province: resLocation.data.province,
            district: resLocation.data.district,
            address: resLocation.data.address,
            notes: resLocation.data.notes
          });
          // Fetch educations for this applicant
          const educationRes = await authApis().get(endpoints.getEducationApplicantProfile);
          setEducations(educationRes.data.map(edu => {
            // Nếu institutionId là số, tìm tên institution từ map
            let institutionId = edu.institution?.id || edu.institutionId;
            let institutionName = edu.institution?.name;

            if (institutionId && !isNaN(Number(institutionId))) {
              // Nếu có institutionId là số, sử dụng tên institution nếu có
              institutionName = institutionName || institutionMap.get(Number(institutionId));
            }

            return {
              educationId: edu.educationId || edu.id || edu.education_id,
              title: edu.title,
              year: edu.year,
              institutionId: institutionName || institutionId, // Ưu tiên tên institution
              levelId: Number(edu.level?.levelId || edu.level?.id || edu.levelId)
            };
          }));
        } catch (err) {
          console.error("Error fetching applicant data:", err);
        }
      }
    };

    if (user.role === "APPLICANT") {
      fetchApplicant();
    }
  }, [user.role, userId]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "file") {
      setUser({ ...user, file: files[0] });
      setPreview(URL.createObjectURL(files[0]));
    } else {
      setUser({ ...user, [name]: value });
    }
  };

  const handleRecruiterChange = (e) => {
    setRecruiter({ ...recruiter, [e.target.name]: e.target.value });
  };

  const handleApplicantChange = (e) => {
    setApplicant({ ...applicant, [e.target.name]: e.target.value });
  };

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
      { educationId: null, title: "", year: "", institutionId: "", levelId: "" },
    ]);
  };

  const removeEducation = (idx) => {
    const educationToRemove = educations[idx];
    if (educationToRemove.educationId && educationToRemove.educationId !== null && educationToRemove.educationId !== undefined) {
      // Lưu ID của education bị xóa để xóa trên server sau
      setDeletedEducationIds(prev => [...prev, educationToRemove.educationId]);
    }
    const updated = educations.filter((_, i) => i !== idx);
    setEducations(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Cập nhật user trước
      const formData = new FormData();

      // Chỉ thêm các field có giá trị
      if (user.email) formData.append("email", user.email);
      if (user.firstName) formData.append("firstName", user.firstName);
      if (user.lastName) formData.append("lastName", user.lastName);
      if (user.phone) formData.append("phone", user.phone);
      if (user.file) formData.append("file", user.file);

      await authApis().patch(endpoints.updateCurrentUser, formData);

      if (user.role === "APPLICANT" &&
        applicantLocation.locationId &&
        applicantLocation.province &&
        applicantLocation.district &&
        applicantLocation.address) {
        try {
          const locationResponse = await authApis().patch(endpoints.updateLocation(applicantLocation.locationId), applicantLocation);
          console.log("Location response:", locationResponse);
          console.log("Update applicant location:", applicantLocation.locationId);
        } catch (error) {
          alert("Cập nhật địa chỉ cho ứng viên thất bại: " + error.message);
          return;
        }
      }

      if (user.role === "RECRUITER" &&
        recruiterLocation.locationId &&
        recruiterLocation.province &&
        recruiterLocation.district &&
        recruiterLocation.address) {
        try {
          const locationResponse = await authApis().patch(endpoints.updateLocation(recruiterLocation.locationId), recruiterLocation);
          console.log("Location response:", locationResponse);
          console.log("Update recruiter location:", recruiterLocation.locationId);
        } catch (error) {
          alert("Cập nhật địa chỉ cho nhà tuyển dụng thất bại: " + error.message);
          return;
        }
      }

      // Nếu role là RECRUITER, cập nhật recruiter sau khi đã cập nhật user
      if (user.role === "RECRUITER") {
        const recruiterUpdateData = {
          userId: parseInt(userId),
          ...recruiter,
          locationId: recruiterLocation.locationId,
        };

        await authApis().patch(endpoints.updateRecruiterProfile, recruiterUpdateData, {
          headers: {
            "Content-Type": "application/json",
          },
        });
      }

      // Nếu role là APPLICANT, cập nhật applicant sau khi đã cập nhật user
      if (user.role === "APPLICANT") {
        const applicantUpdateData = {
          ...applicant,
          userId: parseInt(userId),
          locationId: applicantLocation.locationId,
        };

        const applicantRes = await authApis().patch(endpoints.updateApplicantProfile, applicantUpdateData, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        const applicantId = applicantRes.data.userId || applicantRes.data.id || userId;

        // Cập nhật educations
        const educationsWithIds = [];

        // Cache institutions để tránh gọi API nhiều lần
        let existingInstitutions = null;
        try {
          existingInstitutions = await authApis().get(endpoints.institutions);
        } catch (err) {
          console.error("Error loading institutions:", err);
          existingInstitutions = { data: [] };
        }

        for (const edu of educations) {
          let institutionId = edu.institutionId;

          // Nếu institutionId là string (tên trường từ GitHub API), cần kiểm tra và tạo institution mới nếu chưa có
          if (!institutionId || isNaN(Number(institutionId))) {
            const inst = institutions.find(inst => inst.name === edu.institutionId);
            if (inst) {
              // Kiểm tra xem institution đã tồn tại trong database chưa
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
              } else {
                // Tạo institution mới từ dữ liệu GitHub API
                try {
                  const institutionData = {
                    name: inst.name,
                    domain: inst.domains && inst.domains.length > 0 ? inst.domains[0] : "",
                    website: inst.web_pages && inst.web_pages.length > 0 ? inst.web_pages[0] : "",
                    country: inst.country || ""
                  };

                  const institutionRes = await authApis().post(endpoints.addInstitution, institutionData);
                  institutionId = institutionRes.data.id || institutionRes.data.institutionId;
                } catch (err) {
                  console.error("Error creating institution:", err);
                  continue;
                }
              }
            }
          } else {
            // Nếu institutionId là số, kiểm tra xem có tồn tại trong database không
            const existingInst = existingInstitutions.data.find(existing =>
              existing.id === Number(institutionId) || existing.institutionId === Number(institutionId)
            );

            if (!existingInst) {
              continue;
            }
          }

          educationsWithIds.push({
            educationId: edu.educationId, // Giữ lại educationId nếu có
            title: edu.title,
            year: edu.year,
            levelId: Number(edu.levelId),
            institutionId: Number(institutionId),
            userId: applicantId
          });
        }

        // Xóa những education đã bị xóa
        for (const educationId of deletedEducationIds) {
          if (educationId && educationId !== null && educationId !== undefined) {
            await authApis().delete(endpoints.deleteEducation(educationId));
          }
        }

        // Cập nhật hoặc tạo mới educations
        for (const edu of educationsWithIds) {
          // Chỉ xử lý những education có đủ thông tin
          if (!edu.title || !edu.year || !edu.institutionId || !edu.levelId) {
            continue;
          }

          // Đảm bảo các giá trị là hợp lệ
          if (isNaN(Number(edu.year)) || isNaN(Number(edu.levelId)) || isNaN(Number(edu.institutionId))) {
            continue;
          }

          if (edu.educationId && edu.educationId !== null && edu.educationId !== undefined && !isNaN(Number(edu.educationId))) {
            // Cập nhật education đã tồn tại
            const updateData = {
              educationId: Number(edu.educationId),
              title: edu.title,
              year: edu.year,
              levelId: Number(edu.levelId),
              institutionId: Number(edu.institutionId),
              userId: user.userId
            };
            console.log(updateData.userId);
            try {
              await authApis().patch(endpoints.updateEducation(edu.educationId), updateData);
            } catch (error) {
              console.error("Error updating education:", edu.educationId, error);
            }
          } else {
            // Tạo mới education
            const createData = {
              title: edu.title,
              year: edu.year,
              levelId: Number(edu.levelId),
              institutionId: Number(edu.institutionId),
              userId: user.userId
            };
            await authApis().post(endpoints.createEducation, [createData]);
          }
        }

        // Reset danh sách education đã xóa
        setDeletedEducationIds([]);
      }

      alert("Cập nhật thành công!");
      if (user.role === "RECRUITER") {
        navigate("/recruiter/profile");
      } else if (user.role === "APPLICANT") {
        navigate("/applicant/profile");
      }
    } catch (err) {
      console.error(err);
      alert("Cập nhật thất bại.");
    } finally {
      setIsLoading(false);
    }
  };

  const countryList = Array.from(
    new Set(institutions.map(inst => inst.country).filter(Boolean))
  ).sort();

  return (
    <div className="max-w-3xl mx-auto p-8 bg-gradient-to-br from-blue-100 via-white to-blue-50 rounded-3xl shadow-2xl border border-blue-200 animate-fade-in">
      <h1 className="flex items-center justify-center gap-3 text-4xl font-extrabold mb-10 text-blue-800 text-center tracking-wide drop-shadow-lg">
        <FaUserEdit className="text-blue-500" /> Cập Nhật Hồ Sơ Người Dùng
      </h1>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Email */}
          <div>
            <label className="block mb-1 font-semibold text-gray-600 text-sm">Email</label>
            <input
              type="email"
              name="email"
              value={user.email || ""}
              onChange={handleChange}
              className="w-full border-2 border-blue-200 rounded-xl px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-sm transition-all duration-200 bg-white"
              required
              placeholder="Email"
            />
          </div>

          {/* First Name */}
          <div>
            <label className="block mb-1 font-semibold text-gray-600 text-sm">Họ</label>
            <input
              type="text"
              name="firstName"
              value={user.firstName || ""}
              onChange={handleChange}
              className="w-full border-2 border-blue-200 rounded-xl px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-sm transition-all duration-200 bg-white"
              placeholder="Họ"
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="block mb-1 font-semibold text-gray-600 text-sm">Tên</label>
            <input
              type="text"
              name="lastName"
              value={user.lastName || ""}
              onChange={handleChange}
              className="w-full border-2 border-blue-200 rounded-xl px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-sm transition-all duration-200 bg-white"
              placeholder="Tên"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block mb-1 font-semibold text-gray-600 text-sm">Số điện thoại</label>
            <input
              type="text"
              name="phone"
              value={user.phone || ""}
              onChange={handleChange}
              className="w-full border-2 border-blue-200 rounded-xl px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-sm transition-all duration-200 bg-white"
              placeholder="Số điện thoại"
            />
          </div>

          {/* Avatar Upload */}
          <div className="flex flex-col items-center justify-center gap-2">
            <label className="block mb-1 font-semibold text-gray-600 text-sm">Ảnh đại diện</label>
            <div className="relative group">
              <input
                type="file"
                accept="image/*"
                name="file"
                onChange={handleChange}
                className="absolute opacity-0 w-24 h-24 cursor-pointer z-10"
              />
              <div className="w-24 h-24 rounded-full border-4 border-blue-200 bg-white flex items-center justify-center shadow-lg group-hover:border-blue-400 transition-all duration-200 cursor-pointer relative overflow-hidden">
                {preview ? (
                  <img src={preview} alt="Preview" className="w-full h-full object-cover rounded-full" />
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
                <input
                  type="date"
                  name="dob"
                  value={applicant.dob || ""}
                  onChange={handleApplicantChange}
                  className="w-full border-2 border-blue-200 rounded-xl px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-sm transition-all duration-200 bg-white"
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold text-gray-600 text-sm">Giới tính</label>
                <select
                  name="gender"
                  value={applicant.gender}
                  onChange={handleApplicantChange}
                  className="w-full border-2 border-blue-200 rounded-xl px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-sm transition-all duration-200 bg-white"
                >
                  <option value="MALE">Nam</option>
                  <option value="FEMALE">Nữ</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 font-semibold text-gray-600 text-sm">Số năm kinh nghiệm</label>
                <input
                  name="experienceYears"
                  type="number"
                  value={applicant.experienceYears || ""}
                  placeholder="Số năm kinh nghiệm"
                  onChange={handleApplicantChange}
                  className="w-full border-2 border-blue-200 rounded-xl px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-sm transition-all duration-200 bg-white"
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold text-gray-600 text-sm">Vị trí mong muốn</label>
                <input
                  name="jobTitle"
                  value={applicant.jobTitle || ""}
                  placeholder="Vị trí mong muốn"
                  onChange={handleApplicantChange}
                  className="w-full border-2 border-blue-200 rounded-xl px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-sm transition-all duration-200 bg-white"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block mb-1 font-semibold text-gray-600 text-sm">Kỹ năng</label>
                <textarea
                  name="skills"
                  value={applicant.skills || ""}
                  placeholder="Kỹ năng"
                  onChange={handleApplicantChange}
                  className="w-full border-2 border-blue-200 rounded-xl px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-sm transition-all duration-200 bg-white"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block mb-1 font-semibold text-gray-600 text-sm">Giới thiệu bản thân</label>
                <textarea
                  name="bio"
                  value={applicant.bio || ""}
                  placeholder="Giới thiệu bản thân"
                  onChange={handleApplicantChange}
                  className="w-full border-2 border-blue-200 rounded-xl px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-sm transition-all duration-200 bg-white"
                />
              </div>

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

            </div>
            <h3 className="font-medium mt-8 mb-3 text-blue-600 text-lg flex items-center gap-2">Học vấn</h3>
            {process.env.NODE_ENV === 'development' && (
              <div className="mb-4 p-2 bg-gray-100 rounded text-xs">
                Debug: Levels loaded: {levels.length} items
              </div>
            )}
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
                    value={edu.levelId || ""}
                    onChange={e => handleEducationChange(idx, e)}
                    className="w-full border border-blue-200 rounded-lg px-3 py-2 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200"
                  >
                    <option value="">-- Chọn bậc học --</option>
                    {levels && levels.length > 0 ? (
                      levels.map((level, i) => (
                        <option key={i} value={level.levelId}>{level.name}</option>
                      ))
                    ) : (
                      <option value="" disabled>Không có dữ liệu bậc học</option>
                    )}
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

        {/* Recruiter section */}
        {user.role === "RECRUITER" && (
          <div className="border-t pt-8 mt-10">
            <h2 className="text-2xl font-bold text-blue-700 mb-6">Thông Tin Nhà Tuyển Dụng</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block mb-1 font-semibold text-gray-600 text-sm">Tên công ty</label>
                <input
                  name="companyName"
                  value={recruiter.companyName || ""}
                  onChange={handleRecruiterChange}
                  className="w-full border-2 border-blue-200 rounded-xl px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-sm transition-all duration-200 bg-white"
                  placeholder="Tên công ty"
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold text-gray-600 text-sm">Website công ty</label>
                <input
                  name="companyWebsite"
                  value={recruiter.companyWebsite || ""}
                  onChange={handleRecruiterChange}
                  className="w-full border-2 border-blue-200 rounded-xl px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-sm transition-all duration-200 bg-white"
                  placeholder="Website công ty"
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold text-gray-600 text-sm">Vị trí</label>
                <input
                  name="position"
                  value={recruiter.position || ""}
                  onChange={handleRecruiterChange}
                  className="w-full border-2 border-blue-200 rounded-xl px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-sm transition-all duration-200 bg-white"
                  placeholder="Vị trí"
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold text-gray-600 text-sm">Logo URL</label>
                <input
                  name="logoUrl"
                  value={recruiter.logoUrl || ""}
                  onChange={handleRecruiterChange}
                  className="w-full border-2 border-blue-200 rounded-xl px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-sm transition-all duration-200 bg-white"
                  placeholder="Logo URL"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block mb-1 font-semibold text-gray-600 text-sm">Giới thiệu công ty</label>
                <textarea
                  name="bio"
                  value={recruiter.bio || ""}
                  onChange={handleRecruiterChange}
                  className="w-full border-2 border-blue-200 rounded-xl px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-sm transition-all duration-200 bg-white"
                  placeholder="Giới thiệu công ty"
                  rows="4"
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-center mt-12">
          <button
            type="submit"
            disabled={isLoading}
            className={`bg-gradient-to-r from-blue-600 to-blue-400 text-white px-10 py-4 rounded-2xl font-bold text-xl shadow-xl transition-all duration-200 active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-200 ${isLoading
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:from-blue-700 hover:to-blue-500'
              }`}
          >
            {isLoading ? "Đang cập nhật..." : "Cập Nhật Người Dùng"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateUserPage;
