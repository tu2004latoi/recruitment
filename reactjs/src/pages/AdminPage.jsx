import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaUsers, 
  FaBriefcase, 
  FaIndustry, 
  FaGraduationCap,
  FaPlus,
  FaArrowRight
} from "react-icons/fa";

const AdminPage = () => {
  const navigate = useNavigate();

  const managementItems = [
    {
      title: "Quản lý Người dùng",
      description: "Thêm, sửa, xoá các tài khoản người dùng trong hệ thống",
      icon: <FaUsers className="h-8 w-8 text-blue-600" />,
      onClick: () => navigate("/admin/users"),
      color: "blue",
      gradient: "from-blue-500 to-indigo-600"
    },
    {
      title: "Quản lý Công Việc",
      description: "Thêm, sửa, xoá các công việc tuyển dụng",
      icon: <FaBriefcase className="h-8 w-8 text-indigo-600" />,
      onClick: () => navigate("/admin/jobs"),
      color: "indigo",
      gradient: "from-indigo-500 to-blue-600"
    },
    {
      title: "Quản lý Ngành Nghề",
      description: "Thêm, sửa, xoá các ngành nghề tuyển dụng",
      icon: <FaIndustry className="h-8 w-8 text-orange-600" />,
      onClick: () => navigate("/admin/job-industries"),
      color: "orange",
      gradient: "from-orange-500 to-red-600"
    },
    {
      title: "Quản lý Loại Công Việc",
      description: "Thêm, sửa, xoá các loại công việc khác nhau",
      icon: <FaBriefcase className="h-8 w-8 text-purple-600" />,
      onClick: () => navigate("/admin/job-types"),
      color: "purple",
      gradient: "from-purple-500 to-pink-600"
    },
    {
      title: "Quản lý Trình Độ",
      description: "Thêm, sửa, xoá trình độ học vấn và bằng cấp",
      icon: <FaGraduationCap className="h-8 w-8 text-green-600" />,
      onClick: () => navigate("/admin/levels"),
      color: "green",
      gradient: "from-green-500 to-emerald-600"
    },
  ];

  const quickActions = [
    {
      title: "Thêm người dùng",
      icon: <FaUsers className="w-5 h-5 text-white" />,
      onClick: () => navigate("/admin/users/add"),
      color: "blue",
      bgColor: "bg-blue-500"
    },
    {
      title: "Thêm công việc",
      icon: <FaBriefcase className="w-5 h-5 text-white" />,
      onClick: () => navigate("/admin/jobs/add"),
      color: "indigo",
      bgColor: "bg-indigo-500"
    },
    {
      title: "Thêm ngành nghề",
      icon: <FaIndustry className="w-5 h-5 text-white" />,
      onClick: () => navigate("/admin/job-industries"),
      color: "orange",
      bgColor: "bg-orange-500"
    },
    {
      title: "Thêm loại công việc",
      icon: <FaBriefcase className="w-5 h-5 text-white" />,
      onClick: () => navigate("/admin/job-types"),
      color: "purple",
      bgColor: "bg-purple-500"
    },
    {
      title: "Thêm trình độ",
      icon: <FaGraduationCap className="w-5 h-5 text-white" />,
      onClick: () => navigate("/admin/levels"),
      color: "green",
      bgColor: "bg-green-500"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl shadow-lg mb-6">
            <FaUsers className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold gradient-text mb-4">Bảng Điều Khiển Admin</h1>
          <p className="text-gray-600 text-lg">Quản lý hệ thống và người dùng</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 animate-fade-in-up hover-lift">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng quản lý</p>
                <p className="text-2xl font-bold text-gray-900">{managementItems.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FaUsers className="text-blue-600 text-xl" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 animate-fade-in-up hover-lift" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Người dùng</p>
                <p className="text-2xl font-bold text-green-600">Active</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FaUsers className="text-green-600 text-xl" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 animate-fade-in-up hover-lift" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ngành nghề</p>
                <p className="text-2xl font-bold text-orange-600">Active</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <FaIndustry className="text-orange-600 text-xl" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 animate-fade-in-up hover-lift" style={{ animationDelay: '300ms' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Loại công việc</p>
                <p className="text-2xl font-bold text-purple-600">Active</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <FaBriefcase className="text-purple-600 text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Management Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {managementItems.map((item, index) => (
            <div
              key={index}
              className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-8 cursor-pointer hover:scale-105 border border-gray-100 animate-fade-in-up hover-lift"
              style={{ animationDelay: `${index * 200}ms` }}
              onClick={item.onClick}
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 bg-gradient-to-br ${item.gradient} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    {React.cloneElement(item.icon, { className: "h-8 w-8 text-white" })}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">{item.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{item.description}</p>
                  </div>
                </div>
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-colors duration-300">
                  <FaArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors duration-300" />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse-slow"></div>
                  Sẵn sàng quản lý
                </div>
                <button className={`bg-gradient-to-r ${item.gradient} text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 group-hover:opacity-90`}>
                  Quản lý
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-12 bg-white rounded-2xl p-8 shadow-sm animate-fade-in-up" style={{ animationDelay: '800ms' }}>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Hành động nhanh</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <button 
                key={index}
                onClick={action.onClick}
                className={`flex items-center gap-3 p-4 bg-${action.color}-50 hover:bg-${action.color}-100 rounded-xl transition-colors duration-300 group`}
              >
                <div className={`w-10 h-10 ${action.bgColor} rounded-lg flex items-center justify-center`}>
                  {action.icon}
                </div>
                <span className={`font-medium text-gray-700 group-hover:text-${action.color}-700`}>
                  {action.title}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
