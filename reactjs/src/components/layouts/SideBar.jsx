import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import {
  HomeIcon,
  UserGroupIcon,
  ChartPieIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
  ArrowRightOnRectangleIcon,
  ShieldCheckIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  HeartIcon,
  UserIcon,
  ChatBubbleOvalLeftEllipsisIcon,
} from "@heroicons/react/24/outline";
import { FaUser } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import { MyDispatcherContext, MyUserContext } from "../../configs/MyContexts";

const userMenu = [
  { name: "Dashboard", icon: HomeIcon, path: "/home" },
  { name: "Tìm việc làm", icon: BriefcaseIcon, path: "/jobs" },
  { name: "Settings", icon: Cog6ToothIcon, path: "/settings" },
];

const roleMenus = {
  APPLICANT: [
    { name: "Đơn ứng tuyển", icon: DocumentTextIcon, path: "/applications" },
    { name: "Công việc yêu thích", icon: HeartIcon, path: "/favorites" },
    { name: "Chat", icon: ChatBubbleOvalLeftEllipsisIcon, path: "/chat" },
    { name: "Lịch phỏng vấn của tôi", icon: BriefcaseIcon, path: "/my-interviews" },
    { name: "Tạo CV", icon: UserGroupIcon, path: "/applicant/create-cv" },
  ],
  ADMIN: [
    { name: "Admin Panel", icon: ShieldCheckIcon, path: "/admin" },
    { name: "Thống kê", icon: ChartPieIcon, path: "/admin/statistics" },
    { name: "Manage Users", icon: UserGroupIcon, path: "/admin/users" },
    { name: "Chat", icon: ChatBubbleOvalLeftEllipsisIcon, path: "/chat" },
    { name: "Quản lý công việc", icon: BriefcaseIcon, path: "/admin/jobs" },
  ],
  MODERATOR: [
    { name: "Kiểm duyệt công việc", icon: BriefcaseIcon, path: "/admin/jobs" },
    { name: "Chat", icon: ChatBubbleOvalLeftEllipsisIcon, path: "/chat" },
  ],
  RECRUITER: [
    { name: "Recruiter Dashboard", icon: BriefcaseIcon, path: "/recruiter" },
    { name: "Thống kê", icon: ChartPieIcon, path: "/recruiter/statistics" },
    { name: "My Jobs", icon: BriefcaseIcon, path: "/recruiter/jobs" },
    { name: "Quản lý đơn ứng tuyển", icon: DocumentTextIcon, path: "/recruiter/applications" },
    { name: "Chat", icon: ChatBubbleOvalLeftEllipsisIcon, path: "/chat" },
  ],
};

const Sidebar = () => {
  const user = useContext(MyUserContext);
  const dispatch = useContext(MyDispatcherContext);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const labelKeyByPath = {
    "/home": "sidebar.dashboard",
    "/jobs": "sidebar.findJobs",
    "/settings": "sidebar.settings",
    "/admin": "sidebar.adminPanel",
    "/admin/statistics": "sidebar.statistics",
    "/admin/users": "sidebar.manageUsers",
    "/admin/jobs": "sidebar.manageJobs",
    "/recruiter": "sidebar.recruiterDashboard",
    "/recruiter/statistics": "sidebar.statistics",
    "/recruiter/jobs": "sidebar.myJobs",
    "/recruiter/applications": "sidebar.manageApplications",
    "/chat": "sidebar.chat",
    "/recruiter/profile": "sidebar.profile",
    "/applicant/profile": "sidebar.profile",
    "/login": "sidebar.login",
  };

  const getLabel = (name, path) => {
    const key = labelKeyByPath[path];
    return key ? t(key) : name;
  };

  const handleLogout = () => {
    dispatch({ type: "logout" });
    navigate("/login");
  };

  const handleLogin = () => {
    navigate("/login");
  };

  const renderMenuItem = ({ name, icon: Icon, path, special }) => {
    const active = location.pathname === path;
    return (
      <li key={name}>
        <button
          onClick={() => navigate(path)}
          className={`flex items-center gap-4 w-full text-left px-4 py-3 rounded-md text-sm font-medium transition-all duration-300
            ${special
              ? "bg-indigo-600 text-white font-bold shadow-lg hover:bg-indigo-700"
              : active
                ? "bg-indigo-500 text-white font-bold shadow-md"
                : "text-gray-300 hover:bg-indigo-500 hover:text-white hover:shadow-md hover:pl-5"
            }`}
        >
          <Icon className="w-5 h-5" />
          <span>{getLabel(name, path)}</span>
        </button>
      </li>
    );
  };

  return (
    <div className="fixed top-0 left-0 z-10 w-64 h-screen bg-gray-900 text-white shadow-xl transform -translate-x-56 hover:translate-x-0 transition-transform duration-300">
      <aside className="flex flex-col">

        {/* Logo */}
        <div className="flex items-center justify-center h-16 border-b border-gray-700">
          <img src="/TopJob-Logo-NonBackgroud.png" alt="TopJob" className="h-10 object-contain" />
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2">
            {user ? (
              <>
                {userMenu.map(item => renderMenuItem(item))}
                {roleMenus[user.role]?.map(item => renderMenuItem(item))}
                {(user.role === "RECRUITER" || user.role === "APPLICANT") &&
                  renderMenuItem({
                    name: "Hồ sơ cá nhân",
                    icon: UserIcon,
                    path: user.role === "RECRUITER" ? "/recruiter/profile" : "/applicant/profile",
                  })
                }
              </>
            ) : (
              <>
                {renderMenuItem({ name: "Tìm việc làm", icon: BriefcaseIcon, path: "/jobs" })}
                {renderMenuItem({ name: "Settings", icon: Cog6ToothIcon, path: "/settings" })}
                <li>
                  <button
                    onClick={handleLogin}
                    className="flex items-center gap-4 w-full text-left px-4 py-3 rounded-md text-sm font-medium transition-all duration-300 text-gray-300 hover:bg-indigo-500 hover:text-white hover:shadow-md"
                  >
                    <ArrowRightOnRectangleIcon className="w-5 h-5" />
                    <span>Login</span>
                  </button>
                </li>
              </>
            )}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700">
          {user ? (
            <>
              <div className="mb-3 p-3 bg-gray-800 rounded-md">
                <div className="text-xs text-gray-400 mb-1">Đăng nhập với</div>
                <div className="text-sm font-medium text-white">
                  {user.firstName} {user.lastName}
                </div>
                <div className="text-xs text-gray-400">
                  {user.email} • {user.role}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-4 w-full px-4 py-3 text-sm font-medium rounded-md text-gray-300 hover:bg-red-500 hover:text-white hover:shadow-md transition-all"
              >
                <ArrowLeftOnRectangleIcon className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <div className="text-sm text-gray-500 text-center">Chưa đăng nhập</div>
          )}
        </div>
      </aside>
    </div>
  );
};

export default Sidebar;
