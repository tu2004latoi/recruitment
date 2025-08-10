import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { endpoints, authApis } from "../configs/Apis";

const CreateCVPage = () => {
  const { userId } = useParams();

  const [user, setUser] = useState({});
  const [applicant, setApplicant] = useState({});
  const [applicantLocation, setApplicantLocation] = useState({});
  const [educations, setEducations] = useState([]);
  const [institutionMap, setInstitutionMap] = useState(new Map());
  const [levels, setLevels] = useState([]);
  const [preview, setPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cvPreviewUrl, setCvPreviewUrl] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const res = await authApis().get(endpoints.currentUser);
      setUser({ ...res.data, file: null });
      if (res.data.avatar) setPreview(res.data.avatar);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    authApis()
      .get(endpoints.levels)
      .then((res) => setLevels(res.data))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    const loadInstitutionMap = async () => {
      try {
        const res = await authApis().get(endpoints.institutions);
        const map = new Map();
        res.data.forEach(
          (inst) => map.set(inst.id || inst.institutionId, inst.name)
        );
        setInstitutionMap(map);
      } catch (err) {
        console.error("Error loading institution map:", err);
      }
    };
    loadInstitutionMap();
  }, []);

  useEffect(() => {
    const fetchApplicant = async () => {
      if (user.role === "APPLICANT") {
        try {
          const res = await authApis().get(endpoints.getApplicantProfile);
          setApplicant(res.data);

          const resLocation = await authApis().get(
            endpoints.locationDetail(res.data.location.locationId)
          );
          setApplicantLocation(resLocation.data);

          const educationRes = await authApis().get(
            endpoints.getEducationApplicantProfile
          );
          setEducations(
            educationRes.data.map((edu) => {
              let institutionId = edu.institution?.id || edu.institutionId;
              let institutionName =
                edu.institution?.name || institutionMap.get(Number(institutionId));
              return {
                educationId: edu.educationId || edu.id,
                title: edu.title,
                year: edu.year,
                institutionId: institutionName || institutionId,
                levelId: Number(edu.level?.levelId || edu.level?.id),
              };
            })
          );
        } catch (err) {
          console.error("Error fetching applicant data:", err);
        }
      }
    };

    if (user.role === "APPLICANT") fetchApplicant();
  }, [user.role, userId, institutionMap]);

  // Tạo danh sách kỹ năng
  const skillList = applicant.skills
    ? applicant.skills.split(",").map((skill) => skill.trim())
    : [];

  // Thanh progress bar fix chiều cao 6px, màu xanh #3498db
  // Giả lập độ dài thanh theo độ dài skill (hoặc bạn có thể đổi cách tính)
  const skillLevel = (skill) => {
    let len = skill.length;
    if (len > 20) return 100;
    return 20 + len * 4; // Tối thiểu 20%, tối đa ~100%
  };

  const handleDownloadCV = async () => {
    setIsLoading(true);
    try {
      const res = await authApis().get(endpoints.exportCV(user.userId), {
        responseType: "blob",
      });

      const blobUrl = window.URL.createObjectURL(
        new Blob([res.data], { type: "application/pdf" })
      );
      setCvPreviewUrl(blobUrl);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.setAttribute("download", `cv_${user.userId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Lỗi tải CV:", error);
      alert("Có lỗi xảy ra khi tải CV");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto bg-gray-100">
      <h1 className="text-3xl font-bold mb-6 text-center">Xem trước & Tạo CV</h1>

      {/* Header */}
      <div
        className="flex justify-between items-center p-6"
        style={{ backgroundColor: "#3498db", color: "white", borderRadius: 8 }}
      >
        <div>
          <h2 className="text-4xl font-bold leading-tight">
            {user.firstName} {user.lastName}
          </h2>
          <p className="text-lg font-normal mt-1">
            {applicant.jobTitle || "Ứng viên"}
          </p>
        </div>
        <div>
          {preview ? (
            <img
              src={preview}
              alt="Avatar"
              style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover" }}
            />
          ) : (
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                backgroundColor: "#2980b9",
              }}
            />
          )}
        </div>
      </div>

      {/* Main content: 2 columns */}
      <div
        className="flex mt-6"
        style={{
          minHeight: 400,
          backgroundColor: "white",
          borderRadius: 8,
          overflow: "hidden",
          boxShadow: "0 0 6px rgba(0,0,0,0.1)",
        }}
      >
        {/* Left column */}
        <div
          style={{
            flexBasis: "35%",
            backgroundColor: "#ecf0f1",
            padding: 20,
            color: "#2c3e50",
            overflowY: "auto",
          }}
        >
          {/* Contact info */}
          <h3
            style={{
              fontWeight: "bold",
              fontSize: 16,
              marginBottom: 12,
            }}
          >
            Thông tin liên hệ
          </h3>
          <p>Email: {user.email}</p>
          <p>Điện thoại: {user.phone}</p>
          <p>
            Địa chỉ:{" "}
            {applicantLocation.address
              ? `${applicantLocation.address}, ${applicantLocation.district}, ${applicantLocation.province}`
              : ""}
          </p>

          {/* Skills */}
          <div style={{ marginTop: 30 }}>
            <h3
              style={{
                fontWeight: "bold",
                fontSize: 16,
                marginBottom: 12,
              }}
            >
              Kỹ năng
            </h3>
            {skillList.length === 0 && <p>Chưa có kỹ năng</p>}
            {skillList.map((skill, idx) => {
              const level = skillLevel(skill);
              return (
                <div key={idx} style={{ marginBottom: 12 }}>
                  <p style={{ marginBottom: 6 }}>{skill}</p>
                  <div
                    style={{
                      width: "100%",
                      height: 6,
                      backgroundColor: "#bdc3c7",
                      borderRadius: 3,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${level}%`,
                        height: "100%",
                        backgroundColor: "#3498db",
                        borderRadius: 3,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column */}
        <div
          style={{
            flexBasis: "65%",
            padding: 20,
            color: "#2c3e50",
            overflowY: "auto",
          }}
        >
          <h3
            style={{
              fontWeight: "bold",
              fontSize: 16,
              marginBottom: 12,
            }}
          >
            Giới thiệu
          </h3>
          <p style={{ whiteSpace: "pre-line" }}>
            {applicant.bio || "Không có thông tin giới thiệu"}
          </p>

          <h3
            style={{
              fontWeight: "bold",
              fontSize: 16,
              marginTop: 30,
              marginBottom: 12,
            }}
          >
            Học vấn
          </h3>
          {educations.length === 0 && <p>Chưa có học vấn</p>}
          {educations.map((edu, idx) => (
            <div
              key={idx}
              style={{
                borderBottom: "1px solid #ccc",
                paddingBottom: 8,
                marginBottom: 8,
              }}
            >
              <p
                style={{
                  fontWeight: "bold",
                  fontSize: 14,
                  marginBottom: 4,
                }}
              >
                {edu.year} - {edu.title}
              </p>
              <p style={{ margin: 0 }}>
                Trường: {edu.institutionId} | Trình độ:{" "}
                {levels.find((l) => l.levelId === edu.levelId)?.name || "N/A"}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="mt-6 flex gap-4 justify-center">
        <button
          onClick={handleDownloadCV}
          disabled={isLoading}
          className={`px-6 py-3 rounded-md text-white font-semibold ${
            isLoading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {isLoading ? "Đang tạo CV..." : "Tải CV PDF"}
        </button>

        <button
          onClick={() => alert("Vui lòng chỉnh thông tin tại trang cá nhân")}
          className="px-6 py-3 rounded-md bg-blue-500 text-white hover:bg-blue-600"
        >
          Chỉnh sửa
        </button>
      </div>

      {/* PDF preview */}
      {cvPreviewUrl && (
        <div className="mt-10 max-w-full mx-auto">
          <h2 className="text-xl font-bold mb-4 text-center">Xem trước CV</h2>
          <iframe
            src={cvPreviewUrl}
            title="CV Preview"
            width="100%"
            height="700px"
            style={{ border: "1px solid #ccc", borderRadius: "8px" }}
          />
        </div>
      )}
    </div>
  );
};

export default CreateCVPage;
