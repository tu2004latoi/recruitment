import React, { useEffect, useState, useContext } from "react";
import { authApis, endpoints } from "../configs/Apis";
import { MyUserContext } from "../configs/MyContexts";
import dayjs from "dayjs";
import { CalendarIcon, MapPinIcon, ClipboardDocumentCheckIcon } from "@heroicons/react/24/outline";

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
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-extrabold text-center mb-8 text-indigo-700">
        Lịch phỏng vấn của tôi
      </h1>

      {loading && (
        <div className="flex justify-center items-center space-x-2 text-indigo-600">
          <svg
            className="animate-spin h-6 w-6 text-indigo-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            ></path>
          </svg>
          <span>Đang tải...</span>
        </div>
      )}

      {error && (
        <div className="text-center text-red-600 font-medium py-4">{error}</div>
      )}

      {!loading && !error && interviews.length === 0 && (
        <div className="text-center text-gray-600 italic py-8">
          Bạn chưa có lịch phỏng vấn nào.
        </div>
      )}

      <div className="space-y-6">
        {interviews.map((iv, idx) => (
          <div
            key={iv.id || iv.interviewId || idx}
            className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 p-5 flex flex-col md:flex-row md:items-center gap-6"
          >
            <div className="flex-1 space-y-2">
              <div className="text-xl font-semibold text-indigo-800">
                {iv.job?.title || iv.jobTitle || "(Không rõ vị trí)"}
              </div>

              <div className="flex items-center text-gray-600 space-x-2">
                <CalendarIcon className="w-5 h-5 text-indigo-500" />
                <span>
                  {iv.scheduledAt
                    ? dayjs(iv.scheduledAt).format("HH:mm, DD/MM/YYYY")
                    : "(Chưa đặt thời gian)"}
                </span>
              </div>

              <div className="flex items-center text-gray-600 space-x-2">
                <MapPinIcon className="w-5 h-5 text-indigo-500" />
                <span>
                  {iv.location
                    ? `${iv.location.address}, ${iv.location.district}, ${iv.location.province}`
                    : "(Chưa có địa điểm)"}
                </span>
              </div>

              <div className="flex items-center text-gray-600 space-x-2">
                <ClipboardDocumentCheckIcon className="w-5 h-5 text-indigo-500" />
                <span>Ghi chú: {iv.notes || "-"}</span>
              </div>

              <div>
                Trạng thái:{" "}
                <span className="font-semibold text-indigo-700">{iv.status}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyInterviewsPage;
