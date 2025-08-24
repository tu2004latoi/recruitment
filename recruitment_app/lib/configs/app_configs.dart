class AppConfig {
  static const String appName = "Recruitment App";

  static const String appVersion = "1.0.0";

  static const String apiBaseUrl = "http://10.0.2.2:8080/api";

  static const int apiTimeout = 10000;

  static const String defaultLanguage = "en";

  static const String loginEndpoint = "/login";
  static const String registerApplicantEndpoint = "/register/applicant";
  static const String registerRecruiterEndpoint = "/register/recruiter";
  static const String currentUserEndpoint = "/secure/profile";

  static String publicUserDetails(int id) {
    return "/public/users/$id";
  }

  static const String recruiterProfileEndpoint = "/secure/recruiter/profile";
  static const String updateRecruiterProfileEndpoint =
      "/secure/recruiter/profile/update";
  static String getJobsByRecruiter(int id) {
    return "/users/recruiters/$id/jobs";
  }

  static String getRecruiterDetails(int id) {
    return "/users/recruiters/$id";
  }

  static const String applicantProfileEndpoint = "/secure/applicant/profile";
  static const String updateApplicantProfileEndpoint =
      "/secure/applicant/profile/update";

  static const String educationApplicantEndpoint =
      "/secure/applicant/profile/educations";
  static const String addEducationEndpoint = "/educations/add";
  static String deleteEducationEndpoint(int id) {
    return "/educations/$id/delete";
  }

  static String updateEducationEndpoint(int id) {
    return "/educations/$id/update";
  }

  static const String jobsEndpoint = "/jobs";
  static const String addJobEndpoint = "/jobs/add";
  static String getJobDetailsByRecruiter(int userId, int jobId) {
    return "/users/recruiters/$userId/jobs/$jobId";
  }

  static String jobDetailsEndpoint(int id) {
    return "/jobs/$id";
  }

  static String updateJobEndpoint(int id) {
    return "/jobs/$id/update";
  }

  static String deleteJobEndpoint(int id) {
    return "/jobs/$id/delete";
  }

  static const String jobSuitableEndpoint = "/jobs/suitable";
  static const String jobSerchEndpoint = "/jobs/search";
  static const String industriesEndpoint = "/job-industries";
  static String industryDetailsEndpoint(int id) {
    return "/job-industries/$id";
  }

  static const String jobTypesEndpoint = "/job-types";
  static String jobTypeDetailsEndpoint(int id) {
    return "/job-types/$id";
  }

  static const String levelsEndpoint = "/levels";
  static String levelDetailsEndpoint(int id) {
    return "/levels/$id";
  }

  static const String locationsEndpoint = "/locations";
  static String locationDetailsEndpoint(int id) {
    return "/locations/$id";
  }

  static String updateLocationEndpoint(int id) {
    return "/locations/$id/update";
  }

  static const String addLocationEndpoint = "/locations/add";
  static const String institutionsEndpoint = "/institutions";
  static String institutionDetailsEndpoint(int id) {
    return "/institutions/$id";
  }

  static const String addInstitutionEndpoint = "/institutions/add";

  static String incrementViewCountJobEndpoint(int id) {
    return "/jobs/$id/increment-view";
  }

  static String incrementViewCountApplicationEndpoint(int id) {
    return "/jobs/$id/increment-view-applications";
  }

  static String myFavoritesEndpoint() {
    return "/favorites/my";
  }

  static const String addFavoriteEndpoint = "/favorites/add";
  static String deleteFavoriteEndpoint(int id) {
    return "/favorites/$id/delete";
  }

  static const String addApplicationEndpoint = "/applications/add";
  static String deleteApplicationEndpoint(int id) {
    return "/applications/$id/delete";
  }

  static const String myApplicationsEndpoint = "/applications/my";

  static const String myInterviewEndpoint = "/interviews/my";
  static const String addInterviewEndpoint = "/interviews/add";
  static String deleteInterviewEndpoint(int id) {
    return "/interviews/$id/delete";
  }

  static String sentInterviewEndpoint(int id) {
    return "/applications/$id/sent-interview";
  }

  static String getApplicationRecruiter(int id) {
    return "/users/recruiters/$id/applications";
  }

  static String acceptedApplications(int id) {
    return "/applications/$id/accepted";
  }

  static String rejectedApplications(int id) {
    return "/applications/$id/rejected";
  }

  static const String recruiterStatisticJobEndpoint =
      "/recruiter/statistics/jobs";
  static const String recruiterStatisticApplicationEndpoint =
      "/recruiter/statistics/applications";

  static String messagesPartnersEndpoint(int userId) {
    return "/chat/partners/$userId";
  }

  static String messagesByPartnerEndpoint(int partnerId) {
    return "/chat/messages/$partnerId";
  }

  static const String registerDevice = "/devices/register";

  static const String sendNotification = "/notifications/send";
  static const String sendUserNotification = "/notifications/send-user";

  static const bool isDebug = true;
}
