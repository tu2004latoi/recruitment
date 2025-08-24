import React from "react";
import { useTranslation } from "react-i18next";
import { FaGlobe } from "react-icons/fa";

const SettingsPage = () => {
  const { i18n, t } = useTranslation();
  const current = i18n.language || "vi";

  const handleChange = (e) => {
    const lang = e.target.value;
    i18n.changeLanguage(lang);
    localStorage.setItem("lng", lang);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6 flex justify-center items-start">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl p-8">
        <h1 className="text-3xl font-extrabold mb-6 text-gray-800">{t('settings.title')}</h1>

        <div className="space-y-6">
          {/* Language Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">{t('settings.language')}</label>
            <div className="relative">
              <select
                value={current}
                onChange={handleChange}
                className="block w-full appearance-none rounded-xl border border-gray-300 bg-white px-4 py-3 pr-10 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 sm:text-sm shadow-sm"
              >
                <option value="vi">{t('settings.vietnamese')}</option>
                <option value="en">{t('settings.english')}</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
                <FaGlobe />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
