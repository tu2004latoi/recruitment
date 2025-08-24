import React, { useContext, useState } from 'react';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import Apis, { authApis, endpoints } from '../configs/Apis';
import { FaUser, FaLock } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { MyDispatcherContext } from '../configs/MyContexts';
import { useTranslation } from 'react-i18next';
import { requestForToken } from "../firebase";

const LoginPage = () => {
  const [form, setForm] = useState({ username: '', password: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const dispatch = useContext(MyDispatcherContext);
  const { t } = useTranslation();
  const [showRolePicker, setShowRolePicker] = useState(false);


  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await Apis.post(endpoints.login, form);
      const token = res.data.token;

      if (token) {
        // Lưu token vào nhiều nơi để đảm bảo không bị mất
        Cookies.set('token', token, { expires: 7 }); // Lưu token trong 7 ngày
        localStorage.setItem('token', token);
        sessionStorage.setItem('token', token);
        setMessage(t('login.messages.success'));

        // Gọi API lấy thông tin người dùng
        const userRes = await Apis.get(endpoints.currentUser, {
          headers: { Authorization: `Bearer ${token}` }
        });

        dispatch({
          type: "login",
          payload: userRes.data,
        });

        // Register FCM device token to backend
        try {
          localStorage.removeItem("fcmToken");
          await requestForToken();
          const fcmToken = localStorage.getItem("fcmToken");
          if (fcmToken) {
            await authApis().post(endpoints.registerDevice, {
              userId: userRes.data.userId,
              fcmToken,
              deviceType: "WEB",
            });
          }
        } catch (e) {
          console.warn("Register device failed", e);
        }

        const role = userRes.data.role;
        if (role === 'ADMIN') {
          navigate("/admin");
        } else if (role === 'MODERATOR') {
          navigate("/admin/jobs");
        } else if (role === 'APPLICANT' || role === 'RECRUITER') {
          navigate("/");
        } else {
          setMessage(t('login.messages.roleUnknown'));
        }
      } else {
        setMessage(t('login.messages.missingToken'));
      }
    } catch (err) {
      console.error("Login error:", err);
      setMessage(t('login.messages.errorPrefix') + (err.response?.data?.message || err.message));
    }
  };

  const handleGoogleLogin = () => {
    const googleLoginUrl = "http://localhost:8080/oauth2/authorization/google";
    window.location.href = googleLoginUrl;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-100 to-blue-300">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-lg">
        <h2 className="text-3xl font-bold text-center text-blue-700 mb-6">{t('login.title')}</h2>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50">
            <FaUser className="text-gray-400 mr-2" />
            <input
              type="text"
              name="username"
              placeholder={t('login.placeholders.username')}
              value={form.username}
              onChange={handleChange}
              className="w-full outline-none bg-transparent"
              required
            />
          </div>
          <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50">
            <FaLock className="text-gray-400 mr-2" />
            <input
              type="password"
              name="password"
              placeholder={t('login.placeholders.password')}
              value={form.password}
              onChange={handleChange}
              className="w-full outline-none bg-transparent"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-300"
          >
            {t('login.buttons.login')}
          </button>
        </form>

        <div className="mt-4 flex flex-col items-center space-y-2">
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center border border-gray-300 py-2 rounded-lg hover:bg-gray-100 transition duration-300"
          >
            <FcGoogle className="text-2xl mr-2" />
            <span className="text-gray-700 font-medium">{t('login.buttons.google')}</span>
          </button>

          <button
            onClick={() => setShowRolePicker((v) => !v)}
            className="text-blue-600 hover:underline text-sm font-medium"
          >
            {t('login.buttons.registerNow')}
          </button>

          {showRolePicker && (
            <div className="w-full mt-2 p-3 border rounded-lg bg-gray-50 space-y-2">
              <p className="text-xs text-gray-600">{t('login.prompts.chooseRole') || 'Chọn vai trò đăng ký:'}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate('/register?role=APPLICANT')}
                  className="flex-1 px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 text-sm"
                >
                  {t('login.roles.applicant') || 'Ứng viên'}
                </button>
                <button
                  onClick={() => navigate('/register?role=RECRUITER')}
                  className="flex-1 px-3 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 text-sm"
                >
                  {t('login.roles.recruiter') || 'Nhà tuyển dụng'}
                </button>
              </div>
            </div>
          )}
        </div>
        
        {message && (
          <p className="mt-4 text-center text-sm text-green-700 font-medium">{message}</p>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
