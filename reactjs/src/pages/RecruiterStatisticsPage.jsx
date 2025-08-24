import React, { useEffect, useState } from "react";
import { authApis, endpoints } from "../configs/Apis";
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

const Section = ({ title, children }) => (
  <div className="mb-10">
    <h2 className="text-xl font-bold text-gray-800 mb-4">{title}</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {children}
    </div>
  </div>
);

const RecruiterStatisticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [jobStats, setJobStats] = useState(null);
  const [appStats, setAppStats] = useState(null);
  const { t } = useTranslation();

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        setError("");
        const [jobsRes, appsRes] = await Promise.all([
          authApis().get(endpoints.recruiterStatisticJobs),
          authApis().get(endpoints.recruiterStatisticApplications),
        ]);
        setJobStats(jobsRes.data || {});
        setAppStats(appsRes.data || {});
      } catch (err) {
        console.error(err);
        setError(t('common.errorLoadingStats'));
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  const totalJobs = jobStats?.totalJobs ?? 0;
  const activeJobs = jobStats?.activeJobs ?? 0;
  const featuredJobs = jobStats?.featureJobs ?? 0;
  const totalViews = jobStats?.totalViews ?? 0;
  const inactiveOrOther = Math.max(totalJobs - activeJobs - featuredJobs, 0);

  const jobCountBarData = {
    labels: [t('stats.jobs.total'), t('stats.jobs.active'), t('stats.jobs.featured')],
    datasets: [
      {
        label: t('stats.recruiter.jobs'),
        data: [totalJobs, activeJobs, featuredJobs],
        backgroundColor: ["#6366F1", "#22C55E", "#F59E0B"],
        borderRadius: 8,
      },
    ],
  };

  const jobCountBarOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: t('stats.recruiter.jobsCountChart') },
    },
    scales: {
      y: { beginAtZero: true, ticks: { precision: 0 } },
    },
  };

  const jobDistributionData = {
    labels: [t('stats.jobs.active'), t('stats.jobs.featured'), t('stats.jobs.other')],
    datasets: [
      {
        label: t('stats.recruiter.jobsDistribution'),
        data: [activeJobs, featuredJobs, inactiveOrOther],
        backgroundColor: ["#22C55E", "#F59E0B", "#94A3B8"],
        borderWidth: 1,
      },
    ],
  };

  const jobDistributionOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' },
      title: { display: true, text: t('stats.recruiter.jobsDistribution') },
    },
  };

  const viewsBarData = {
    labels: [t('stats.jobs.views')],
    datasets: [
      {
        label: t('stats.jobs.views'),
        data: [totalViews],
        backgroundColor: ["#3B82F6"],
        borderRadius: 8,
      },
    ],
  };

  const viewsBarOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: t('stats.recruiter.viewsChart') },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  const appsBarData = {
    labels: [t('stats.applications.total')],
    datasets: [
      {
        label: t('sections.applications'),
        data: [appStats?.totalApplications ?? 0],
        backgroundColor: ["#6366F1"],
        borderRadius: 8,
      },
    ],
  };

  const appsBarOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: t('stats.recruiter.applicationsChart') },
    },
    scales: {
      y: { beginAtZero: true, ticks: { precision: 0 } },
    },
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
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg border border-red-200">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">{t('stats.recruiter.title')}</h1>
          <p className="text-gray-600">{t('stats.recruiter.subtitle')}</p>
        </div>

        {/* Jobs */}
        <Section title={t('sections.jobs')}>
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <Bar data={jobCountBarData} options={jobCountBarOptions} />
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <Doughnut data={jobDistributionData} options={jobDistributionOptions} />
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm md:col-span-2">
            <Bar data={viewsBarData} options={viewsBarOptions} />
          </div>
        </Section>

        {/* Applications */}
        <Section title={t('sections.applications')}>
          <div className="bg-white p-4 rounded-xl shadow-sm md:col-span-2">
            <Bar data={appsBarData} options={appsBarOptions} />
          </div>
        </Section>
      </div>
    </div>
  );
};

export default RecruiterStatisticsPage;
