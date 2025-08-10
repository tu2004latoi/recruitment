import React, { useContext, useState } from 'react';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import Apis, { endpoints } from '../configs/Apis';
import { FaUser, FaLock } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { MyDispatcherContext } from '../configs/MyContexts';

const LoginPage = () => {
  const [form, setForm] = useState({ username: '', password: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const dispatch = useContext(MyDispatcherContext);


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
        setMessage('✅ Đăng nhập thành công!');

        // Gọi API lấy thông tin người dùng
        const userRes = await Apis.get(endpoints.currentUser, {
          headers: { Authorization: `Bearer ${token}` }
        });

        dispatch({
          type: "login",
          payload: userRes.data,
        });

        const role = userRes.data.role;
        if (role === 'ADMIN') {
          navigate("/admin");
        } else if (role === 'MODERATOR') {
          navigate("/admin/jobs");
        } else if (role === 'APPLICANT' || role === 'RECRUITER') {
          navigate("/");
        } else {
          setMessage("❌ Không xác định được vai trò người dùng!");
        }
      } else {
        setMessage('❌ Đăng nhập thất bại: không có token');
      }
    } catch (err) {
      console.error("Login error:", err);
      setMessage('❌ Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleGoogleLogin = () => {
    const googleLoginUrl = "http://localhost:8080/oauth2/authorization/google";
    window.location.href = googleLoginUrl;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-100 to-blue-300">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-lg">
        <h2 className="text-3xl font-bold text-center text-blue-700 mb-6">Đăng nhập</h2>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50">
            <FaUser className="text-gray-400 mr-2" />
            <input
              type="text"
              name="username"
              placeholder="Tên đăng nhập"
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
              placeholder="Mật khẩu"
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
            Đăng nhập
          </button>
        </form>

        <div className="mt-4 flex flex-col items-center space-y-2">
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center border border-gray-300 py-2 rounded-lg hover:bg-gray-100 transition duration-300"
          >
            <FcGoogle className="text-2xl mr-2" />
            <span className="text-gray-700 font-medium">Đăng nhập với Google</span>
          </button>

          <p className="text-sm text-gray-600">Chưa có tài khoản?</p>
          <button
            onClick={() => navigate("/register")}
            className="text-blue-600 hover:underline text-sm font-medium"
          >
            Đăng ký ngay
          </button>
        </div>
        
        {message && (
          <p className="mt-4 text-center text-sm text-green-700 font-medium">{message}</p>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
