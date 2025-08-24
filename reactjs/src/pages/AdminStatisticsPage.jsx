import React, { useEffect, useState } from "react";
import { authApis, endpoints } from "../configs/Apis";
import { FaUsers, FaUserCheck, FaUserSlash, FaUserShield, FaUserTie, FaUser, FaBriefcase, FaCheck, FaStar, FaTimesCircle, FaListUl } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, ChartTitle, Tooltip, Legend);

const StatCard = ({ title, value, icon: Icon, color = "indigo" }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
      </div>
      <div className={`w-12 h-12 bg-${color}-100 rounded-lg flex items-center justify-center`}>
        <Icon className={`text-${color}-600 text-xl`} />
      </div>
    </div>
  </div>
);

const Section = ({ title, children }) => (
  <div className="mb-10">
    <h2 className="text-xl font-bold text-gray-800 mb-4">{title}</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {children}
    </div>
  </div>
);

const AdminStatisticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userStats, setUserStats] = useState(null);
  const [jobStats, setJobStats] = useState(null);
  const [appStats, setAppStats] = useState(null);
  const { t } = useTranslation();

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        setError("");
        const [u, j, a] = await Promise.all([
          authApis().get(endpoints.statisticUser),
          authApis().get(endpoints.statisticJob),
          authApis().get(endpoints.statisticApplication),
        ]);
        setUserStats(u.data || {});
        setJobStats(j.data || {});
        setAppStats(a.data || {});
      } catch (err) {
        console.error(err);
        setError(t('common.errorLoadingStats'));
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  // Prepare computed values and chart data
  const totalUsers = userStats?.totalUsers ?? 0;
  const activeUsers = userStats?.activeUsers ?? 0;
  const inactiveUsers = userStats?.inactiveUsers ?? 0;
  const applicantCount = userStats?.applicants ?? 0;
  const recruiterCount = userStats?.recruiters ?? 0;
  const moderatorCount = userStats?.moderators ?? 0;
  const adminCount = userStats?.admins ?? 0;

  const usersRoleBarData = {
    labels: [
      t('stats.users.applicants'),
      t('stats.users.recruiters'),
      t('stats.users.moderators'),
      t('stats.users.admins'),
    ],
    datasets: [
      {
        label: t('sections.users'),
        data: [applicantCount, recruiterCount, moderatorCount, adminCount],
        backgroundColor: ["#3B82F6"],
        borderRadius: 8,
      },
    ],
  };

  const usersRoleBarOptions = {
    responsive: true,
    plugins: { legend: { display: false }, title: { display: true, text: t('stats.admin.usersByRole') } },
    scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
  };

  const usersActiveDoughnutData = {
    labels: [t('stats.users.active'), t('stats.users.inactive')],
    datasets: [
      {
        label: t('stats.admin.usersActiveVsInactive'),
        data: [activeUsers, inactiveUsers],
        backgroundColor: ["#22C55E", "#EF4444"],
        borderWidth: 1,
      },
    ],
  };

  const usersActiveDoughnutOptions = {
    responsive: true,
    plugins: { legend: { position: 'bottom' }, title: { display: true, text: t('stats.admin.usersActiveVsInactive') } },
  };

  const totalJobs = jobStats?.totalJobs ?? 0;
  const activeJobs = jobStats?.activeJobs ?? 0;
  const featuredJobs = jobStats?.featuredJobs ?? 0;
  const otherJobs = Math.max(totalJobs - activeJobs - featuredJobs, 0);

  const jobCountBarData = {
    labels: [t('stats.jobs.total'), t('stats.jobs.active'), t('stats.jobs.featured')],
    datasets: [
      {
        label: t('sections.jobs'),
        data: [totalJobs, activeJobs, featuredJobs],
        backgroundColor: ["#6366F1", "#22C55E", "#F59E0B"],
        borderRadius: 8,
      },
    ],
  };

  const jobCountBarOptions = {
    responsive: true,
    plugins: { legend: { display: false }, title: { display: true, text: t('stats.admin.jobsCountChart') } },
    scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
  };

  const jobDistributionData = {
    labels: [t('stats.jobs.active'), t('stats.jobs.featured'), t('stats.jobs.other')],
    datasets: [
      {
        label: t('stats.admin.jobsDistribution'),
        data: [activeJobs, featuredJobs, otherJobs],
        backgroundColor: ["#22C55E", "#F59E0B", "#94A3B8"],
        borderWidth: 1,
      },
    ],
  };

  const jobDistributionOptions = {
    responsive: true,
    plugins: { legend: { position: 'bottom' }, title: { display: true, text: t('stats.admin.jobsDistribution') } },
  };

  const totalApplications = appStats?.totalApplication ?? appStats?.totalApplications ?? 0;
  const acceptedApplications = appStats?.acceptedApplications ?? 0;
  const rejectedApplications = appStats?.rejectedApplications ?? 0;

  const appsBarData = {
    labels: [t('stats.applications.total'), t('stats.applications.accepted'), t('stats.applications.rejected')],
    datasets: [
      {
        label: t('sections.applications'),
        data: [totalApplications, acceptedApplications, rejectedApplications],
        backgroundColor: ["#6366F1", "#22C55E", "#EF4444"],
        borderRadius: 8,
      },
    ],
  };

  const appsBarOptions = {
    responsive: true,
    plugins: { legend: { display: false }, title: { display: true, text: t('stats.admin.applicationsChart') } },
    scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-indigo-600 font-semibold">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg border border-red-200">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">{t('stats.admin.title')}</h1>
          <p className="text-gray-600">{t('stats.admin.subtitle')}</p>
        </div>

        {/* Users */}
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <StatCard title={t('stats.users.total')} value={totalUsers} icon={FaUsers} color="indigo" />
          <StatCard title={t('stats.users.active')} value={activeUsers} icon={FaUserCheck} color="green" />
          <StatCard title={t('stats.users.inactive')} value={inactiveUsers} icon={FaUserSlash} color="orange" />
          <StatCard title={t('stats.users.applicants')} value={applicantCount} icon={FaUser} color="blue" />
          <StatCard title={t('stats.users.recruiters')} value={recruiterCount} icon={FaUserTie} color="purple" />
          <StatCard title={t('stats.users.moderators')} value={moderatorCount} icon={FaUserShield} color="pink" />
          <StatCard title={t('stats.users.admins')} value={adminCount} icon={FaUserShield} color="red" />
        </div>
        <Section title={t('sections.users')}>
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <Bar data={usersRoleBarData} options={usersRoleBarOptions} />
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <Doughnut data={usersActiveDoughnutData} options={usersActiveDoughnutOptions} />
          </div>
        </Section>

        {/* Jobs */}
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <StatCard title={t('stats.jobs.total')} value={totalJobs} icon={FaBriefcase} color="indigo" />
          <StatCard title={t('stats.jobs.active')} value={activeJobs} icon={FaCheck} color="green" />
          <StatCard title={t('stats.jobs.featured')} value={featuredJobs} icon={FaStar} color="yellow" />
        </div>
        <Section title={t('sections.jobs')}>
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <Bar data={jobCountBarData} options={jobCountBarOptions} />
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <Doughnut data={jobDistributionData} options={jobDistributionOptions} />
          </div>
        </Section>

        {/* Applications */}
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard title={t('stats.applications.total')} value={totalApplications} icon={FaListUl} color="indigo" />
          <StatCard title={t('stats.applications.accepted')} value={acceptedApplications} icon={FaCheck} color="green" />
          <StatCard title={t('stats.applications.rejected')} value={rejectedApplications} icon={FaTimesCircle} color="red" />
        </div>
        <Section title={t('sections.applications')}>
          <div className="bg-white p-4 rounded-xl shadow-sm md:col-span-2">
            <Bar data={appsBarData} options={appsBarOptions} />
          </div>
        </Section>
      </div>
    </div>
  );
};

export default AdminStatisticsPage;

