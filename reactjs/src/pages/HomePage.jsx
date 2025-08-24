import React, { useContext } from "react";
import { MyUserContext } from "../configs/MyContexts";
import { useNavigate } from "react-router";
import { FaBriefcase, FaSearch, FaUser, FaChartBar } from "react-icons/fa";
import { useTranslation } from "react-i18next";

const HomePage = () => {
  const user = useContext(MyUserContext);
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="text-5xl font-bold gradient-text mb-4">
            {t('home.header.title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('home.header.subtitle')}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div
            className="group bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer animate-fade-in-up"
            onClick={() => navigate("/jobs")}
          >
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <FaSearch className="text-white text-2xl" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('home.quickActions.findJobs.title')}</h3>
            <p className="text-gray-600">{t('home.quickActions.findJobs.desc')}</p>
          </div>

          {user && user.role === "RECRUITER" && (
            <div
              className="group bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer animate-fade-in-up"
              style={{ animationDelay: '100ms' }}
              onClick={() => navigate("/recruiter")}
            >
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FaBriefcase className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('home.quickActions.postJob.title')}</h3>
              <p className="text-gray-600">{t('home.quickActions.postJob.desc')}</p>
            </div>
          )}

          {user && (
            <div
              onClick={() => {
                if (user.role === "APPLICANT") {
                  navigate("/applicant/profile");
                } else if (user.role === "RECRUITER") {
                  navigate("/recruiter/profile");
                }
              }}
              className="group bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer animate-fade-in-up"
              style={{
                animationDelay: user.role === "RECRUITER" ? "200ms" : "100ms",
              }}
            >
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FaUser className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {t('home.quickActions.profile.title')}
              </h3>
              <p className="text-gray-600">
                {t('home.quickActions.profile.desc')}
              </p>
            </div>
          )}
        </div>

        {/* Welcome Message */}
        <div className="bg-white rounded-xl p-8 shadow-sm animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {user ? t('home.welcome.loggedInTitle', { firstName: user.firstName, lastName: user.lastName }) : t('home.welcome.loggedOutTitle')}
            </h2>
            <p className="text-gray-600 text-lg mb-6">
              {user
                ? t('home.welcome.loggedInDesc')
                : t('home.welcome.loggedOutDesc')
              }
            </p>
            {!user && (
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => navigate("/login")}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 hover:scale-105"
                >
                  {t('home.buttons.login')}
                </button>
                <button
                  onClick={() => navigate("/register")}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 hover:scale-105"
                >
                  {t('home.buttons.register')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
