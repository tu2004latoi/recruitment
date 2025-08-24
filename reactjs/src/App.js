import { useEffect, useReducer, useState } from 'react';
import './App.css';
import MyUserReducer from './components/reducers/MyUserReducer';
import { authApis, endpoints } from './configs/Apis';
import Cookies from 'js-cookie';
import { MyDispatcherContext, MyUserContext } from './configs/MyContexts';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LoginPage from './pages/LoginPage';
import { Container } from 'react-bootstrap';
import Sidebar from './components/layouts/SideBar';
import Footer from './components/layouts/Footer';
import AdminPage from './pages/AdminPage';
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import UserManagementPage from './pages/UserManagementPage';
import AddUserPage from './pages/AddUserPage';
import UpdateUserPage from './pages/UpdateUserPage';

import { requestForToken, onMessageListener } from './firebase';
import JobTypePage from './pages/JobTypePage';
import JobIndustryPage from './pages/JobIndustryPage';
import LevelPage from './pages/LevelPage';
import JobPage from './pages/JobPage';
import AddJobPage from './pages/AddJobPage';
import UpdateJobPage from './pages/UpdateJobPage';
import RecruiterPage from './pages/RecruiterPage';
import UpdateJobForRecruiterPage from './pages/UpdateJobForRecruiterPage';
import AddJobForRecruiterPage from './pages/AddJobForRecruiterPage';
import JobListingPage from './pages/JobListingPage';
import JobDetailPage from './pages/JobDetailPage';
import AdminJobManagementPage from './pages/AdminJobManagementPage';
import ApplicationManagementPage from './pages/ApplicationManagementPage';
import RecruiterApplicationManagementPage from './pages/RecruiterApplicationManagementPage';
import FavoriteJobsPage from './pages/FavoriteJobsPage';
import JobDetailForAdminPage from './pages/JobDetailForAdminPage';
import MyInterviewsPage from './pages/MyInterviewsPage';
import ApplicantProfilePage from "./pages/ApplicantProfilePage";
import EditProfilePage from "./pages/EditProfilePage";
import RecruiterProfilePage from './pages/RecruiterProfilePage';
import CreateCVPage from './pages/CreateCVPage';
import AdminStatisticsPage from './pages/AdminStatisticsPage';
import RecruiterStatisticsPage from './pages/RecruiterStatisticsPage';
import SettingsPage from './pages/SettingsPage';
import ChatPage from './pages/ChatPage';

function App() {
  const [user, dispatch] = useReducer(MyUserReducer, null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  // 🔔 Push Notification setup
  // useEffect(() => {
  //   const setupNotifications = async () => {
  //     try {
  //       const permission = await Notification.requestPermission();
  //       if (permission === "granted") {
  //         await requestForToken(); // đã bao gồm getToken bên trong
  //         onMessageListener().then((payload) => {
  //           console.log("Nhận thông báo foreground:", payload);
  //           alert(payload?.notification?.title + "\n" + payload?.notification?.body);
  //         });
  //       }
  //     } catch (err) {
  //       console.error("Lỗi thông báo:", err);
  //     }
  //   };

  //   setupNotifications();
  // }, []);

  // Load user từ cookie
  useEffect(() => {
    const loadUser = async () => {
      const token = Cookies.get("token");
      const localToken = localStorage.getItem("token");
      const sessionToken = sessionStorage.getItem("token");
      
      // Ưu tiên token từ cookie, sau đó localStorage, cuối cùng sessionStorage
      const finalToken = token || localToken || sessionToken;
      
      if (finalToken && finalToken !== "undefined" && finalToken !== "null") {
        try {
          // Kiểm tra token có hợp lệ không
          if (finalToken.length < 10) {
            Cookies.remove("token");
            localStorage.removeItem("token");
            sessionStorage.removeItem("token");
            dispatch({
              type: "logout",
              payload: null,
            });
            setLoading(false);
            return;
          }
          
          const res = await authApis().get(endpoints.currentUser);
          dispatch({
            type: "login",
            payload: res.data,
          });
        } catch (err) {
          console.error("Lỗi load user từ token:", err);
          // Xóa tất cả token nếu không hợp lệ
          Cookies.remove("token");
          localStorage.removeItem("token");
          sessionStorage.removeItem("token");
          dispatch({
            type: "logout",
            payload: null,
          });
        }
      } else {
        dispatch({
          type: "logout",
          payload: null,
        });
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-100 to-blue-300">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-blue-600 font-semibold">{t('common.loading')}</p>
      </div>
    </div>
  );

  return (
    <MyUserContext.Provider value={user}>
      <MyDispatcherContext.Provider value={dispatch}>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col">
            <div className="flex flex-1">
              <Sidebar />
              <main className="flex-1 bg-gray-100 h-full">
                <Container className="pt-4">
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/admin" element={<AdminPage />} />
                    <Route path="/admin/statistics" element={<AdminStatisticsPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/admin/users" element={<UserManagementPage />} />
                    <Route path="/admin/users/add" element={<AddUserPage />} />
                    <Route path="/admin/users/:userId/update" element={<UpdateUserPage />} />
                    <Route path="/admin/job-types" element={<JobTypePage />} />
                    <Route path="/admin/job-industries" element={<JobIndustryPage />} />
                    <Route path="/admin/levels" element={<LevelPage />} />
                    <Route path="/admin/jobs/add" element={<AddJobPage />} />
                    <Route path="/admin/jobs/:jobId/update" element={<UpdateJobPage />} />
                    <Route path="/recruiter" element={<RecruiterPage />} />
                    <Route path="/recruiter/jobs" element={<JobPage />} />
                    <Route path="/recruiter/jobs/add" element={<AddJobForRecruiterPage />} />
                    <Route path="/recruiter/jobs/:jobId/update" element={<UpdateJobForRecruiterPage />} />
                    <Route path="/recruiter/statistics" element={<RecruiterStatisticsPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/jobs" element={<JobListingPage />} />
                    <Route path="/jobs/:jobId" element={<JobDetailPage />} />
                    <Route path="/favorites" element={<FavoriteJobsPage />} />
                    <Route path="/admin/jobs" element={<AdminJobManagementPage />} />
                    <Route path="/applications" element={<ApplicationManagementPage />} />
                    <Route path="/recruiter/applications" element={<RecruiterApplicationManagementPage />} />
                    <Route path="/admin/jobs/:jobId/view" element={<JobDetailForAdminPage />} />
                    <Route path="/home" element={<Navigate to="/" replace />} />
                    <Route path="/my-interviews" element={<MyInterviewsPage />} />
                    <Route path="/applicant/profile" element={<ApplicantProfilePage />} />
                    <Route path="/recruiter/profile" element={<RecruiterProfilePage />} />
                    <Route path="/applicant/profile/edit" element={<EditProfilePage />} />
                    <Route path="/recruiter/profile/edit" element={<EditProfilePage />} />
                    <Route path="/applicant/create-cv" element={<CreateCVPage />} />
                    <Route path="/chat" element={<ChatPage />} />
                  </Routes>
                </Container>
              </main>
            </div>
            <Footer />
          </div>
        </BrowserRouter>
      </MyDispatcherContext.Provider>
    </MyUserContext.Provider>
  );
}

export default App;
