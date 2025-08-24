import axios from "axios";
import Cookies from 'js-cookie';

export const BASE_URL = "http://localhost:8080/api";

export const endpoints = {
  login: "/login",
  currentUser: "/secure/profile",
  updateCurrentUser: "/secure/profile/update",
  changePassword: "/secure/profile/change-password",

  // Register
  registerApplicant: "/register/applicant",
  registerRecruiter: "/register/recruiter",

  publicUserDetails: (id) => `/public/users/${id}`,

  locations: "/locations",
  locationDetail: (id) => `/locations/${id}`,
  createLocation: "/locations/add",
  updateLocation: (id) => `/locations/${id}/update`,
  deleteLocation: (id) => `/locations/${id}/delete`,

  // Users
  users: "/users",
  userDetail: (id) => `/users/${id}`,
  applicantDetail: (id) => `/users/applicants/${id}`,
  createUser: "/users/add",
  updateUser: (id) => `/users/${id}/update`,
  deleteUser: (id) => `/users/${id}/delete`,

  createAdmin: "/users/admins/add",
  updateAdmin: (id) => `/users/admins/${id}/update`,
  statisticUser: "/admin/statistics/users",
  statisticJob: "/admin/statistics/jobs",
  statisticApplication: "/admin/statistics/applications",

  createModerator: "/users/moderators/add",
  updateModerator: (id) => `/users/moderators/${id}/update`,

  createRecruiter: "/users/recruiters/add",
  recruiterDetail: (id) => `/users/recruiters/${id}`,
  updateRecruiter: (id) => `/users/recruiters/${id}/update`,
  getRecruiterProfile: "/secure/recruiter/profile",
  updateRecruiterProfile: "/secure/recruiter/profile/update",
  recruiterStatisticJobs: "/recruiter/statistics/jobs",
  recruiterStatisticApplications: "/recruiter/statistics/applications",
  
  createApplicant: "/users/applicants/add",
  updateApplicant: (id) => `/users/applicants/${id}/update`,
  getApplicantProfile: "/secure/applicant/profile",
  getEducationApplicantProfile: "/secure/applicant/profile/educations",
  updateApplicantProfile: "/secure/applicant/profile/update",

  // Education
  createEducation: "/educations/add",
  getEducationsByApplicant: (userId) => `/users/applicants/${userId}/educations`,
  applicantEducations: (userId) => `/users/applicants/${userId}/educations`,
  updateEducation: (id) => `/educations/${id}/update`,
  deleteEducation: (id) => `/educations/${id}/delete`,
  deleteApplicantEducations: (userId) => `/users/applicants/${userId}/educations`,

  // Institutions & Levels
  addInstitution: "/institutions/add",
  institutions: "/institutions",
  institutionDetail: (id) => `/institutions/${id}`,
  levels: "/levels",

  levelDetail: (id) => `/levels/${id}`,
  createLevel: "/levels/add",
  updateLevel: (id) => `/levels/${id}/update`,
  deleteLevel: (id) => `/levels/${id}/delete`,

  jobTypes: "/job-types",
  jobTypeDetail: (id) => `/job-types/${id}`,
  createJobType: "/job-types/add",
  updateJobType: (id) => `/job-types/${id}/update`,
  deleteJobType: (id) => `/job-types/${id}/delete`,

  jobIndustries: "/job-industries",
  jobIndustryDetail: (id) => `/job-industries/${id}`,
  createJobIndustry: "/job-industries/add",
  updateJobIndustry: (id) => `/job-industries/${id}/update`,
  deleteJobIndustry: (id) => `/job-industries/${id}/delete`,

  jobs: "/jobs",
  jobDetail: (id) => `/jobs/${id}`,
  createJob: "/jobs/add",
  updateJob: (id) => `/jobs/${id}/update`,
  deleteJob: (id) => `/jobs/${id}/delete`,
  getJobsByRecruiter: (userId) => `/users/recruiters/${userId}/jobs`,
  getJobDetailsByRecruiter: (userId, jobId) => `/users/recruiters/${userId}/jobs/${jobId}`,
  jobSearch: "/jobs/search",
  incrementViewCountJob: (id) => `/jobs/${id}/increment-view`,
  incrementViewCountApplication: (id) => `/jobs/${id}/increment-view-applications`,
  suitableJobs: (id) => `/jobs/suitable/${id}`,

  approveJob: (id) => `/jobs/${id}/approved`,
  rejectJob: (id) => `/jobs/${id}/rejected`,
  activationJob: (id) => `/jobs/${id}/activation`,

  applications: "/applications",
  applicationDetail: (id) => `/applications/${id}`,
  createApplication: "/applications/add",
  updateApplication: (id) => `/applications/${id}/update`,
  deleteApplication: (id) => `/applications/${id}/delete`,
  getApplicationsByJob: (jobId) => `/jobs/${jobId}/applications`,
  getApplicationsByApplicant: (userId) => `/users/applicants/${userId}/applications`,
  myApplications: "/applications/my",
  acceptedApplications: (id) => `/applications/${id}/accepted`,
  sendAcceptedMail: "/send/email/accepted",
  rejectedApplications: (id) => `/applications/${id}/rejected`,
  getApplicationsByRecruiter: (userId) => `/users/recruiters/${userId}/applications`,
  sentInterview: (id) => `/applications/${id}/sent-interview`,

  favoriteJobs: "/favorites",
  addFavorite: "/favorites/add",
  updateFavorite: (id) => `/favorites/${id}/update`,
  deleteFavorite: (id) => `/favorites/${id}/delete`,
  getFavoritesByApplicant: (userId) => `/users/applicants/${userId}/favorites`,
  myFavorites: "/favorites/my",

  interviews: "/interviews",
  interviewDetail: (id) => `/interviews/${id}`,
  createInterview: "/interviews/add",
  updateInterview: (id) => `/interviews/${id}/update`,
  deleteInterview: (id) => `/interviews/${id}/delete`,
  getInterviewsByJob: (jobId) => `/jobs/${jobId}/interviews`,
  // getInterviewsByApplicant: (applicantId) => `/users/applicants/${applicantId}/interviews`,
  myInterviews: "/interviews/my",

  exportCV: (id) => `/export/${id}`,

  // Notifications
  sendNotification: "/notifications/send",
  sendUserNotification: "/notifications/send-user",

  registerDevice: "/devices/register",
  getDevicesByUser: (userId) => `/devices/${userId}`,
  removeDevice: (fcmToken) => `/devices/${fcmToken}`,

  messagesPartners: (userId) => `/chat/partners/${userId}`,
  messagesByPartner: (partnerId) => `/chat/messages/${partnerId}`,
};

export const authApis = () => {
  // Lấy token từ nhiều nơi
  const cookieToken = Cookies.get("token");
  const localToken = localStorage.getItem("token");
  const sessionToken = sessionStorage.getItem("token");
  
  const token = cookieToken || localToken || sessionToken;

  return axios.create({
    baseURL: BASE_URL,
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
    withCredentials: true,
  });
};

export default axios.create({
  baseURL: BASE_URL,
});
