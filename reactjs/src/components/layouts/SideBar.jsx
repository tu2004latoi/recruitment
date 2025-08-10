import React, { useContext } from "react";
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
} from "@heroicons/react/24/outline";
import { FaUser } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import { MyDispatcherContext, MyUserContext } from "../../configs/MyContexts";

// Menu chung cho tất cả user đăng nhập
const userMenu = [
  { name: "Dashboard", icon: HomeIcon, path: "/home" },
  { name: "Tìm việc làm", icon: BriefcaseIcon, path: "/jobs" },
  { name: "Analytics", icon: ChartPieIcon, path: "/analytics" },
  { name: "Settings", icon: Cog6ToothIcon, path: "/settings" },
];

// Menu riêng từng role
const roleMenus = {
  APPLICANT: [
    { name: "Đơn ứng tuyển", icon: DocumentTextIcon, path: "/applications" },
    { name: "Công việc yêu thích", icon: HeartIcon, path: "/favorites" },
    { name: "Lịch phỏng vấn của tôi", icon: BriefcaseIcon, path: "/my-interviews" },
    { name: "Tạo CV", icon: FaUser, path: "/applicant/create-cv", special: true }, // Nút đặc biệt
  ],
  ADMIN: [
    { name: "Admin Panel", icon: ShieldCheckIcon, path: "/admin" },
    { name: "Manage Users", icon: UserGroupIcon, path: "/admin/users" },
    { name: "Quản lý công việc", icon: BriefcaseIcon, path: "/admin/jobs" },
  ],
  MODERATOR: [
    { name: "Kiểm duyệt công việc", icon: BriefcaseIcon, path: "/admin/jobs" },
  ],
  RECRUITER: [
    { name: "Recruiter Dashboard", icon: BriefcaseIcon, path: "/recruiter" },
    { name: "My Jobs", icon: BriefcaseIcon, path: "/recruiter/jobs" },
    { name: "Quản lý đơn ứng tuyển", icon: DocumentTextIcon, path: "/recruiter/applications" },
  ],
};

const Sidebar = () => {
  const user = useContext(MyUserContext);
  const dispatch = useContext(MyDispatcherContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    dispatch({ type: "logout" });
    navigate("/login");
  };

  const handleLogin = () => {
    navigate("/login");
  };

  // Hàm render item menu chung
  const renderMenuItem = ({ name, icon: Icon, path, hoverColor, special }) => (
    <li key={name}>
      <button
        onClick={() => navigate(path)}
        className={`flex items-center gap-4 w-full text-left px-4 py-3 rounded-md text-sm font-medium transition-all duration-300
          ${special
            ? "bg-pink-500 text-white font-bold shadow-lg hover:bg-pink-600"
            : `${location.pathname === path ? `${hoverColor} text-white font-bold` : "hover:" + hoverColor} hover:shadow-md hover:pl-5`
          }`}
      >
        <Icon className="w-5 h-5" />
        <span>{name}</span>
      </button>
    </li>
  );

  return (
    <div className="fixed top-0 left-0 z-0 w-64 h-screen bg-gray-800 text-white shadow-xl">
      <aside className="flex flex-col">
        
        {/* Logo */}
        <div className="flex items-center justify-center h-16 text-2xl font-bold tracking-wide border-b border-gray-700">
          <span className="text-indigo-400">My</span>App
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2">
            {user ? (
              <>
                {/* Menu chung */}
                {userMenu.map(item => renderMenuItem({ ...item, hoverColor: "bg-indigo-500" }))}

                {/* Menu riêng role */}
                {roleMenus[user.role]?.map(item =>
                  renderMenuItem({
                    ...item,
                    hoverColor:
                      user.role === "ADMIN" ? "bg-yellow-500" :
                      user.role === "MODERATOR" ? "bg-orange-500" :
                      user.role === "RECRUITER" ? "bg-blue-500" :
                      "bg-green-500"
                  })
                )}

                {/* Hồ sơ cá nhân */}
                {(user.role === "RECRUITER" || user.role === "APPLICANT") &&
                  renderMenuItem({
                    name: "Hồ sơ cá nhân",
                    icon: UserIcon,
                    path: user.role === "RECRUITER" ? "/recruiter/profile" : "/applicant/profile",
                    hoverColor: "bg-green-500"
                  })
                }
              </>
            ) : (
              <>
                {/* Menu khi chưa đăng nhập */}
                {renderMenuItem({ name: "Tìm việc làm", icon: BriefcaseIcon, path: "/jobs", hoverColor: "bg-indigo-500" })}
                <li>
                  <button
                    onClick={handleLogin}
                    className="flex items-center gap-4 w-full text-left px-4 py-3 rounded-md text-sm font-medium transition-all duration-300 hover:bg-indigo-500 hover:shadow-md"
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
              {/* Thông tin user */}
              <div className="mb-3 p-3 bg-gray-700 rounded-md">
                <div className="text-xs text-gray-300 mb-1">Đăng nhập với</div>
                <div className="text-sm font-medium text-white">
                  {user.firstName} {user.lastName}
                </div>
                <div className="text-xs text-gray-400">
                  {user.email} • {user.role}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-4 w-full px-4 py-3 text-sm font-medium rounded-md hover:bg-red-500 hover:shadow-md transition-all"
              >
                <ArrowLeftOnRectangleIcon className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <div className="text-sm text-gray-400 text-center">Chưa đăng nhập</div>
          )}
        </div>
      </aside>
    </div>
  );
};

export default Sidebar;
