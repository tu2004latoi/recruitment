import React, { useEffect, useState, useContext } from "react";
import { authApis, endpoints } from "../configs/Apis";
import { MyUserContext } from "../configs/MyContexts";
import dayjs from "dayjs";

const MyInterviewsPage = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const user = useContext(MyUserContext);

  useEffect(() => {
    const fetchInterviews = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await authApis().get(endpoints.myInterviews);
        const interviewsRaw = res.data;
        // Lấy thông tin job và location cho từng interview
        const interviewsWithDetails = await Promise.all(
          interviewsRaw.map(async (iv) => {
            let job = null;
            let location = null;
            try {
              if (iv.jobId) {
                const jobRes = await authApis().get(endpoints.jobDetail(iv.jobId));
                job = jobRes.data;
              }
            } catch {}
            try {
              if (iv.locationId) {
                const locRes = await authApis().get(endpoints.locationDetail(iv.locationId));
                location = locRes.data;
              }
            } catch {}
            return { ...iv, job, location };
          })
        );
        setInterviews(interviewsWithDetails);
      } catch (err) {
        setError("Không thể tải lịch phỏng vấn!");
      } finally {
        setLoading(false);
      }
    };
    fetchInterviews();
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">Lịch phỏng vấn của tôi</h1>
      {loading && <div>Đang tải...</div>}
      {error && <div className="text-red-600">{error}</div>}
      {!loading && !error && interviews.length === 0 && (
        <div>Không có lịch phỏng vấn nào.</div>
      )}
      <div className="space-y-4">
        {interviews.map((iv, idx) => (
          <div key={iv.id || iv.interviewId || idx} className="bg-white rounded-xl shadow p-4 flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <div className="font-semibold">Vị trí: {iv.job?.title || iv.jobTitle || "(Không rõ)"}</div>
              <div>Thời gian: {iv.scheduledAt ? dayjs(iv.scheduledAt).format("HH:mm DD/MM/YYYY") : "(Chưa đặt)"}</div>
              <div>Địa điểm: {iv.location ? `${iv.location.address}, ${iv.location.district}, ${iv.location.province}` : "(Chưa có)"}</div>
              <div>Ghi chú: {iv.notes || "-"}</div>
              <div>Trạng thái: <span className="font-medium">{iv.status}</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyInterviewsPage;
