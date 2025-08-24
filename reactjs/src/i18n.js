import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Simple resources. Expand these across the app as needed.
const resources = {
  en: {
    translation: {
      common: {
        loading: 'Loading...',
        errorLoadingStats: 'Failed to load statistics. Please try again.'
      },
      stats: {
        admin: {
          title: 'System Statistics',
          subtitle: 'Overview of users, jobs and applications',
          usersByRole: 'Users by role',
          usersActiveVsInactive: 'Active vs Inactive users',
          jobsCountChart: 'Jobs count chart',
          jobsDistribution: 'Jobs distribution',
          applicationsChart: 'Applications chart'
        },
        recruiter: {
          title: 'Recruiter Statistics',
          subtitle: 'Overview of your jobs and applications',
          jobsCountChart: 'Jobs count chart',
          applicationsCountChart: 'Applications count chart',
          jobDistributionChart: 'Job distribution chart',
          applicationDistributionChart: 'Application distribution chart',
          jobViewsChart: 'Job views chart',
          applicationStatusChart: 'Application status chart',
          jobsDistribution: 'Jobs distribution',
        },
        users: {
          total: 'Total users',
          active: 'Active',
          inactive: 'Inactive',
          applicants: 'Applicants',
          recruiters: 'Recruiters',
          moderators: 'Moderators',
          admins: 'Admins',
        },
        jobs: {
          total: 'Total jobs',
          active: 'Active',
          featured: 'Featured',
          views: 'Total views',
          other: 'Other'
        },
        applications: {
          total: 'Total applications',
          accepted: 'Accepted',
          rejected: 'Rejected'
        }
      },
      sections: {
        users: 'Users',
        jobs: 'Jobs',
        applications: 'Applications'
      },
      settings: {
        title: 'Settings',
        language: 'Language',
        selectLanguage: 'Select language',
        vietnamese: 'Vietnamese',
        english: 'English'
      },
      sidebar: {
        dashboard: 'Dashboard',
        findJobs: 'Find jobs',
        analytics: 'Analytics',
        settings: 'Settings',
        adminPanel: 'Admin Panel',
        statistics: 'Statistics',
        manageUsers: 'Manage Users',
        manageJobs: 'Manage Jobs',
        chat: 'Chat',
        recruiterDashboard: 'Recruiter Dashboard',
        myJobs: 'My Jobs',
        manageApplications: 'Manage Applications',
        profile: 'Profile',
        login: 'Login',
        logout: 'Logout'
      },
      home: {
        header: {
          title: 'Welcome to the recruitment system',
          subtitle: 'Discover career opportunities that fit you or post jobs for your business'
        },
        quickActions: {
          findJobs: { title: 'Find jobs', desc: 'Explore thousands of suitable jobs' },
          postJob: { title: 'Post a job', desc: 'Create new job postings for your business' },
          profile: { title: 'Profile', desc: 'Manage personal information and account settings' },
          statistics: { title: 'Statistics', desc: 'View detailed statistics and reports' }
        },
        welcome: {
          loggedInTitle: 'Welcome back, {{firstName}} {{lastName}}!',
          loggedOutTitle: 'Welcome to the system!',
          loggedInDesc: 'An intelligent recruitment system to help you find opportunities or manage postings effectively.',
          loggedOutDesc: 'Register an account to experience all features of the recruitment system.'
        },
        buttons: { login: 'Login', register: 'Register' }
      },
      login: {
        title: 'Login',
        placeholders: { username: 'Username', password: 'Password' },
        buttons: { login: 'Login', google: 'Login with Google', registerNow: 'Register now' },
        prompts: { noAccount: "Don't have an account?" },
        messages: {
          success: '✅ Login successful!',
          roleUnknown: '❌ Cannot determine user role!',
          missingToken: '❌ Login failed: no token',
          errorPrefix: '❌ Error: '
        },
        prompts: { chooseRole: 'Choose role' },
        roles: { applicant: 'Applicant', recruiter: 'Recruiter' },
      },
      register: {
        title: 'Create account',
        subtitle: 'Create a new account to get started',
        labels: {
          firstName: 'First name',
          lastName: 'Last name',
          email: 'Email',
          phone: 'Phone',
          username: 'Username',
          password: 'Password',
          confirmPassword: 'Confirm password',
          attachment: 'Attachment (optional)'
        },
        placeholders: {
          firstName: 'Enter first name',
          lastName: 'Enter last name',
          email: 'Enter email',
          phone: 'Enter phone number',
          username: 'Enter username',
          password: 'Enter password',
          confirmPassword: 'Re-enter password'
        },
        buttons: { register: 'Register', registering: 'Registering...' },
        prompts: {
          haveAccount: 'Already have an account?',
          loginNow: 'Login now'
        },
        messages: {
          passwordMismatch: 'Passwords do not match!',
          failed: 'Registration failed!'
        },
        accepts: 'Accepts PDF, DOC, DOCX files'
      },
      jobListing: {
        labels: {
          expiresAt: 'Expires: {{date}}',
          unknown: 'Unknown',
          featured: 'Featured'
        },
        pagination: { prev: 'Previous', next: 'Next' },
        metrics: {
          quantity: 'Quantity: {{count}}',
          views: 'Views: {{count}}',
          applications: 'Applications: {{count}}'
        },
        alerts: { loadFailed: 'Failed to load job list!' }
      },
      jobDetail: {
        alerts: {
          notAvailable: 'This job is not available or not approved!',
          loadFailed: 'Failed to load job information!',
          onlyApplicantCanApply: 'Only applicants can apply for this job!',
          alreadyApplied: 'You have already applied for this job!',
          userNotFound: 'User information not found!',
          bookmarkAdded: 'Job saved',
          bookmarkFailed: 'An error occurred while updating favorites!',
          bookmarkRemoved: 'Removed from favorites',
          linkCopied: 'Link copied to clipboard!',
          applicationSent: 'Your application has been sent successfully!',
          applicationFailed: 'Failed to send application. Please try again later.'
        },
        headers: {
          notFound: 'Job not found',
          jobDetail: 'Job detail',
          jobInfo: 'Detailed information about this opportunity'
        },
        labels: {
          unknown: 'Unknown',
          applyJob: 'Apply for job',
          coverLetter: 'Cover letter',
          resume: 'CV/Resume',
          resumeAccepts: 'Accepts PDF, DOC, DOCX files',
          featured: 'Featured job',
          expiresAt: 'Expires: {{date}}',
          level: 'Level',
          jobType: 'Job type',
          industry: 'Industry',
          noDescription: 'No detailed description',
          alreadyApplied: 'You have already applied for this position',
          applyNow: 'Apply for this position'
        },
        sections: {
          recruiterInfo: 'Recruiter information',
          otherInfo: 'Other information'
        },
        tags: {
          postedPrefix: 'Posted:'
        },
        buttons: {
          submit: 'Submit application',
          submitting: 'Submitting...',
          cancel: 'Cancel',
          applyNow: 'Apply now',
          loginToApply: 'Login to apply',
          backToList: 'Back to list',
          bookmark: 'Save job',
          onlyApplicantCanBookmark: 'Only applicants can save jobs',
          share: 'Share',
          viewOnMap: 'View on Google Map',
          alreadyApplied: 'Already applied'
        },
        placeholders: { coverLetter: 'Write your cover letter...' },
        metrics: {
          quantity: 'Positions',
          views: 'Views',
          applications: 'Applications',
          posted: 'Posted'
        },
        time: {
          today: 'Today',
          daysAgo: '{{count}} day ago',
          daysAgo_plural: '{{count}} days ago',
          weeksAgo: '{{count}} week ago',
          weeksAgo_plural: '{{count}} weeks ago',
          monthsAgo: '{{count}} month ago',
          monthsAgo_plural: '{{count}} months ago'
        },
        shareText: 'Job opportunity: {{title}}',
        currency: {
          vnd: 'VND'
        },
        salary: {
          negotiable: 'Negotiable'
        }
      },
      adminJobs: {
        alerts: {
          accessDenied: 'You do not have permission to access this page!',
          loadUserFailed: 'Unable to load user information!',
          loadFailed: 'Unable to load data!',
          deleteConfirm: 'Are you sure you want to delete this job?',
          deleteSuccess: 'Job deleted successfully!'
        },
        actions: {
          view: 'View details',
          edit: 'Edit',
          activate: 'Activate',
          deactivate: 'Deactivate',
          approve: 'Approve job',
          reject: 'Reject job',
          delete: 'Delete job'
        }
      },
      recruiterApps: {
        headers: {
          title: 'Application management',
          subtitle: 'View and process applications for your jobs'
        },
        labels: { total: 'Total' },
        table: {
          applicant: 'Applicant',
          job: 'Job',
          appliedAt: 'Applied at',
          status: 'Status',
          actions: 'Actions'
        },
        status: {
          pending: 'Pending',
          accepted: 'Accepted',
          rejected: 'Rejected',
          interview: 'Interview'
        },
        badges: { sentInterview: 'Interview sent' },
        buttons: {
          viewDetail: 'View details',
          accept: 'Accept',
          acceptAgain: 'Accept again',
          reject: 'Reject',
          rejectAgain: 'Reject (Accepted)',
          sendInterview: 'Send interview schedule',
          sending: 'Sending...',
          cancel: 'Cancel',
          close: 'Close'
        },
        form: {
          province: 'Province/City',
          district: 'District',
          address: 'Specific address',
          notes: 'Notes'
        },
        modal: {
          title: 'Application details',
          applicantInfo: 'Applicant information',
          applicationInfo: 'Application information',
          applicationId: 'Application ID',
          userId: 'User ID',
          fullName: 'Full name',
          noInfo: 'No information',
          none: 'None',
          position: 'Position',
          coverLetter: 'Cover letter',
          resume: 'CV/Resume',
          viewResume: 'View CV/Resume'
        },
        alerts: {
          loadFailed: 'Failed to load applications!',
          sendInterviewSuccess: 'Interview schedule sent successfully!',
          sendInterviewFailed: 'Failed to send interview schedule!',
          acceptConfirm: 'Are you sure you want to accept this application?',
          acceptAgainConfirm: "Are you sure you want to accept this previously rejected application? This will change status from 'Rejected' to 'Accepted'.",
          acceptSuccess: 'Application accepted and notification email sent!',
          acceptAgainSuccess: 'Previously rejected application accepted and notification email sent!',
          acceptError: 'An error occurred while accepting the application!',
          rejectConfirm: 'Are you sure you want to reject this application?',
          rejectAgainConfirm: "Are you sure you want to reject this previously accepted application? This will change status from 'Accepted' to 'Rejected'.",
          rejectSuccess: 'Application rejected!',
          rejectAgainSuccess: 'Previously accepted application rejected!',
          rejectError: 'An error occurred while rejecting the application!'
        },
        empty: 'No applications yet'
      },
      recruiterAddJob: {
        headers: {
          title: 'Post a job',
          subtitle: 'Create a new job posting'
        },
        labels: {
          title: 'Job title',
          location: 'Location',
          description: 'Job description',
          salaryVnd: 'Salary (VND)',
          quantity: 'Quantity',
          expiredAt: 'Expires at',
          level: 'Level',
          jobType: 'Job type',
          industry: 'Industry',
          statusActive: 'Active'
        },
        placeholders: {
          title: 'Enter job title...',
          location: 'Enter location...',
          description: 'Enter detailed job description...',
          salary: 'Enter salary...',
          quantity: 'Quantity...'
        },
        options: {
          selectLevel: 'Select level',
          selectJobType: 'Select job type',
          selectIndustry: 'Select industry'
        },
        recruiterInfo: {
          actingAs: 'Posting as: {{firstName}} {{lastName}}',
          userId: 'User ID: {{id}}',
          locationId: 'Location ID: {{id}}'
        },
        buttons: {
          submit: 'Post job',
          cancel: 'Cancel'
        },
        alerts: {
          missingUser: 'Cannot get user information. Please try again!',
          createSuccess: 'Job posted successfully!',
          createFailedWithMessage: 'Failed to post job: {{message}}',
          createFailed: 'Failed to post job!'
        }
      },
      addUser: {
        headers: { title: 'Add User' },
        sections: {
          applicant: 'Applicant Information',
          recruiter: 'Recruiter Information',
          location: 'Address information',
          education: 'Education'
        },
        labels: {
          username: 'Username',
          password: 'Password',
          email: 'Email',
          firstName: 'First Name',
          lastName: 'Last Name',
          phone: 'Phone',
          role: 'Role',
          provider: 'Provider',
          providerId: 'Provider ID',
          avatar: 'Avatar/File',
          chooseImage: 'Choose image',
          dob: 'Date of birth',
          gender: 'Gender',
          male: 'Male',
          female: 'Female',
          expYears: 'Years of experience',
          desiredTitle: 'Desired position',
          skills: 'Skills',
          bio: 'About me',
          province: 'Province/City',
          district: 'District',
          address: 'Detailed address',
          notes: 'Notes',
          companyName: 'Company name',
          companyWebsite: 'Company website',
          position: 'Position',
          logoUrl: 'Logo URL',
          companyBio: 'Company introduction',
          country: 'Country',
          searchSchool: 'Search school...',
          degreeTitle: 'Degree title',
          year: 'Year',
          selectSchool: '-- Select school --',
          selectLevel: '-- Select level --',
          removeEducation: 'Remove education'
        },
        placeholders: {
          username: 'Username',
          password: 'Password',
          email: 'Email',
          firstName: 'First Name',
          lastName: 'Last Name',
          phone: 'Phone',
          providerId: 'Provider ID',
          expYears: 'Years of experience',
          desiredTitle: 'Desired position',
          skills: 'Skills',
          bio: 'About me',
          province: 'e.g., Hanoi',
          district: 'e.g., Cau Giay',
          address: 'e.g., 123 ABC Street',
          notes: 'Address notes (optional)',
          degreeTitle: 'Degree title',
          year: 'Year'
        },
        role: {
          placeholder: '-- Select role --',
          admin: 'ADMIN',
          moderator: 'MODERATOR',
          recruiter: 'RECRUITER',
          applicant: 'APPLICANT'
        },
        provider: {
          local: 'LOCAL',
          google: 'GOOGLE'
        },
        buttons: {
          submit: 'Add User',
          addEducation: 'Add education'
        },
        alerts: {
          createApplicantLocationFailed: 'Failed to create applicant address: {{message}}',
          createRecruiterLocationFailed: 'Failed to create recruiter address: {{message}}',
          successAndNotify: 'User added successfully and notification sent!',
          successNoToken: 'User added successfully! (No FCM token found to send notification)',
          notifyFailed: 'Added successfully but sending notification failed!',
          failed: 'Add user failed.'
        },
        notification: {
          title: 'Notification',
          bodySuccess: 'User created successfully!'
        }
      }
    }
  },
  vi: {
    translation: {
      common: {
        loading: 'Đang tải...',
        errorLoadingStats: 'Không thể tải thống kê. Vui lòng thử lại.'
      },
      stats: {
        admin: {
          title: 'Thống kê hệ thống',
          subtitle: 'Tổng quan người dùng, công việc và đơn ứng tuyển',
          usersByRole: 'Người dùng theo vai trò',
          usersActiveVsInactive: 'Người dùng hoạt động vs không hoạt động',
          jobsCountChart: 'Biểu đồ tổng hợp công việc',
          jobsDistribution: 'Biểu đồ phân phối công việc',
          applicationsChart: 'Biểu đồ đơn ứng tuyển'
        },
        recruiter: {
          title: 'Thống kê nhà tuyển dụng',
          subtitle: 'Tổng quan công việc và đơn ứng tuyển của bạn',
          jobsCountChart: 'Biểu đồ tổng hợp công việc',
          applicationsCountChart: 'Biểu đồ tổng hợp đơn ứng tuyển',
          jobDistributionChart: 'Biểu đồ phân phối công việc',
          applicationDistributionChart: 'Biểu đồ phân phối đơn ứng tuyển',
          jobViewsChart: 'Biểu đồ lượt xem công việc',
          applicationStatusChart: 'Biểu đồ trạng thái đơn ứng tuyển',
          jobsDistribution: 'Biểu đồ phân phối công việc',
          viewsChart: 'Biểu đồ lượt xem',
          applicationsChart: 'Biểu đồ đơn ứng tuyển',
          jobs: 'Công việc',
          
        },
        users: {
          total: 'Tổng người dùng',
          active: 'Đang hoạt động',
          inactive: 'Không hoạt động',
          applicants: 'Ứng viên',
          recruiters: 'Nhà tuyển dụng',
          moderators: 'Điều hành',
          admins: 'Quản trị'
        },
        jobs: {
          total: 'Tổng công việc',
          active: 'Đang hiển thị',
          featured: 'Nổi bật',
          views: 'Tổng lượt xem',
          other: 'Khác'
        },
        applications: {
          total: 'Tổng đơn',
          accepted: 'Đã chấp nhận',
          rejected: 'Đã từ chối',
        }
      },
      sections: {
        users: 'Người dùng',
        jobs: 'Công việc',
        applications: 'Đơn ứng tuyển'
      },
      settings: {
        title: 'Cài đặt',
        language: 'Ngôn ngữ',
        selectLanguage: 'Chọn ngôn ngữ',
        vietnamese: 'Tiếng Việt',
        english: 'Tiếng Anh'
      },
      sidebar: {
        dashboard: 'Bảng điều khiển',
        findJobs: 'Tìm việc làm',
        analytics: 'Phân tích',
        settings: 'Cài đặt',
        adminPanel: 'Bảng quản trị',
        statistics: 'Thống kê',
        chat: 'Nhắn tin',
        manageUsers: 'Quản lý người dùng',
        manageJobs: 'Quản lý công việc',
        recruiterDashboard: 'Trang nhà tuyển dụng',
        myJobs: 'Công việc của tôi',
        manageApplications: 'Quản lý đơn ứng tuyển',
        profile: 'Hồ sơ',
        login: 'Đăng nhập',
        logout: 'Đăng xuất'
      },
      home: {
        header: {
          title: 'Chào mừng đến với hệ thống tuyển dụng',
          subtitle: 'Khám phá cơ hội nghề nghiệp phù hợp với bạn hoặc đăng tin tuyển dụng cho doanh nghiệp của bạn'
        },
        quickActions: {
          findJobs: { title: 'Tìm việc làm', desc: 'Khám phá hàng nghìn cơ hội nghề nghiệp phù hợp' },
          postJob: { title: 'Đăng tin tuyển dụng', desc: 'Tạo tin tuyển dụng mới cho doanh nghiệp của bạn' },
          profile: { title: 'Hồ sơ cá nhân', desc: 'Quản lý thông tin cá nhân và cài đặt tài khoản' },
          statistics: { title: 'Thống kê', desc: 'Xem thống kê và báo cáo chi tiết' }
        },
        welcome: {
          loggedInTitle: 'Chào mừng trở lại, {{firstName}} {{lastName}}!',
          loggedOutTitle: 'Chào mừng bạn đến với hệ thống!',
          loggedInDesc: 'Hệ thống tuyển dụng thông minh giúp bạn tìm kiếm cơ hội nghề nghiệp hoặc quản lý tin tuyển dụng một cách hiệu quả.',
          loggedOutDesc: 'Đăng ký tài khoản để trải nghiệm đầy đủ các tính năng của hệ thống tuyển dụng.'
        },
        buttons: { login: 'Đăng nhập', register: 'Đăng ký' }
      },
      login: {
        title: 'Đăng nhập',
        placeholders: { username: 'Tên đăng nhập', password: 'Mật khẩu' },
        buttons: { login: 'Đăng nhập', google: 'Đăng nhập với Google', registerNow: 'Đăng ký ngay' },
        prompts: { noAccount: 'Chưa có tài khoản?' },
        messages: {
          success: '✅ Đăng nhập thành công!',
          roleUnknown: '❌ Không xác định được vai trò người dùng!',
          missingToken: '❌ Đăng nhập thất bại: không có token',
          errorPrefix: '❌ Lỗi: '
        },
        prompts: { chooseRole: 'Chọn vai trò đăng ký:' },
        roles: { applicant: 'Ứng viên', recruiter: 'Nhà tuyển dụng' },
      },
      register: {
        title: 'Đăng ký tài khoản',
        subtitle: 'Tạo tài khoản mới để bắt đầu',
        labels: {
          firstName: 'Họ',
          lastName: 'Tên',
          email: 'Email',
          phone: 'Số điện thoại',
          username: 'Tên đăng nhập',
          password: 'Mật khẩu',
          confirmPassword: 'Xác nhận mật khẩu',
          attachment: 'Tệp đính kèm (nếu có)'
        },
        placeholders: {
          firstName: 'Nhập họ',
          lastName: 'Nhập tên',
          email: 'Nhập email',
          phone: 'Nhập số điện thoại',
          username: 'Nhập tên đăng nhập',
          password: 'Nhập mật khẩu',
          confirmPassword: 'Nhập lại mật khẩu'
        },
        buttons: { register: 'Đăng ký', registering: 'Đang đăng ký...' },
        prompts: {
          haveAccount: 'Đã có tài khoản?',
          loginNow: 'Đăng nhập ngay'
        },
        messages: {
          passwordMismatch: 'Mật khẩu không khớp!',
          failed: 'Đăng ký thất bại!'
        },
        accepts: 'Chấp nhận file PDF, DOC, DOCX'
      },
      jobListing: {
        labels: {
          expiresAt: 'Hết hạn: {{date}}',
          unknown: 'Không xác định',
          featured: 'Nổi bật'
        },
        pagination: { prev: 'Trang trước', next: 'Trang sau' },
        metrics: {
          quantity: 'Số lượng: {{count}}',
          views: 'Lượt xem: {{count}}',
          applications: 'Ứng tuyển: {{count}}'
        },
        alerts: { loadFailed: 'Không thể tải danh sách công việc!' }
      },
      jobDetail: {
        alerts: {
          notAvailable: 'Công việc này không khả dụng hoặc chưa được duyệt!',
          loadFailed: 'Không thể tải thông tin công việc!',
          onlyApplicantCanApply: 'Chỉ ứng viên mới có thể ứng tuyển công việc!',
          alreadyApplied: 'Bạn đã ứng tuyển công việc này rồi!',
          userNotFound: 'Không tìm thấy thông tin người dùng!',
          bookmarkAdded: 'Đã lưu công việc',
          bookmarkFailed: 'Có lỗi xảy ra khi thao tác với favorites!',
          linkCopied: 'Đã sao chép link vào clipboard!'
        },
        headers: {
          notFound: 'Không tìm thấy công việc',
          jobDetail: 'Chi tiết công việc',
          jobInfo: 'Thông tin chi tiết về cơ hội nghề nghiệp'
        },
        labels: {
          unknown: 'Không xác định',
          applyJob: 'Ứng tuyển công việc',
          coverLetter: 'Thư xin việc',
          resume: 'CV/Resume',
          resumeAccepts: 'Chấp nhận file PDF, DOC, DOCX',
          featured: 'Công việc nổi bật',
          expiresAt: 'Hết hạn: {{date}}',
          level: 'Trình độ',
          jobType: 'Loại công việc',
          industry: 'Ngành nghề',
          noDescription: 'Chưa có mô tả chi tiết',
          alreadyApplied: 'Bạn đã nộp đơn ứng tuyển cho vị trí này',
          applyNow: 'Nộp đơn ứng tuyển cho vị trí này'
        },
        sections: {
          recruiterInfo: 'Thông tin nhà tuyển dụng',
          otherInfo: 'Thông tin khác',
          jobDescription: 'Mô tả công việc',
          jobRequirements: 'Yêu cầu công việc'
        },
        tags: {
          postedPrefix: 'Đăng tin:'
        },
        buttons: {
          submit: 'Gửi đơn ứng tuyển',
          submitting: 'Đang gửi...',
          cancel: 'Hủy',
          applyNow: 'Ứng tuyển ngay',
          loginToApply: 'Đăng nhập để ứng tuyển',
          backToList: 'Quay lại danh sách',
          bookmark: 'Lưu công việc',
          onlyApplicantCanBookmark: 'Chỉ ứng viên mới có thể lưu công việc',
          share: 'Chia sẻ',
          viewOnMap: 'Xem trên Google Map',
          alreadyApplied: 'Đã ứng tuyển'
        },
        placeholders: { coverLetter: 'Viết thư xin việc của bạn...' },
        metrics: {
          quantity: 'Vị trí',
          views: 'Lượt xem',
          applications: 'Ứng tuyển',
          posted: 'Đăng tin'
        },
        time: {
          today: 'Hôm nay',
          daysAgo: '{{count}} ngày trước',
          weeksAgo: '{{count}} tuần trước',
          monthsAgo: '{{count}} tháng trước'
        },
        shareText: 'Cơ hội việc làm: {{title}}',
        currency: {
          vnd: 'VNĐ'
        },
        salary: {
          negotiable: 'Thỏa thuận'
        }
      },
      adminJobs: {
        alerts: {
          accessDenied: 'Bạn không có quyền truy cập trang này!',
          loadUserFailed: 'Không thể tải thông tin người dùng!',
          loadFailed: 'Không thể tải dữ liệu!',
          deleteConfirm: 'Bạn có chắc chắn muốn xóa công việc này không?',
          deleteSuccess: 'Xóa công việc thành công!'
        },
        actions: {
          view: 'Xem chi tiết',
          edit: 'Chỉnh sửa',
          activate: 'Kích hoạt',
          deactivate: 'Ngừng kích hoạt',
          approve: 'Duyệt công việc',
          reject: 'Từ chối',
          delete: 'Xóa công việc'
        }
      },
      recruiterApps: {
        headers: {
          title: 'Quản lý đơn ứng tuyển',
          subtitle: 'Xem và xử lý các đơn ứng tuyển cho công việc của bạn'
        },
        labels: { total: 'Tổng' },
        table: {
          applicant: 'Ứng viên',
          job: 'Công việc',
          appliedAt: 'Ngày ứng tuyển',
          status: 'Trạng thái',
          actions: 'Hành động'
        },
        status: {
          pending: 'Chờ xử lý',
          accepted: 'Đã chấp nhận',
          rejected: 'Đã từ chối',
          interview: 'Phỏng vấn'
        },
        badges: { sentInterview: 'Đã gửi lịch PV' },
        buttons: {
          viewDetail: 'Xem chi tiết',
          accept: 'Chấp nhận',
          acceptAgain: 'Chấp nhận lại',
          reject: 'Từ chối',
          rejectAgain: 'Từ chối (Đã chấp nhận)',
          sendInterview: 'Gửi lịch phỏng vấn',
          sending: 'Đang gửi...',
          cancel: 'Hủy',
          close: 'Đóng'
        },
        form: {
          province: 'Tỉnh/Thành phố',
          district: 'Quận/Huyện',
          address: 'Địa chỉ cụ thể',
          notes: 'Ghi chú'
        },
        modal: {
          title: 'Chi tiết đơn ứng tuyển',
          applicantInfo: 'Thông tin ứng viên',
          applicationInfo: 'Thông tin đơn ứng tuyển',
          applicationId: 'ID đơn',
          userId: 'User ID',
          fullName: 'Họ tên',
          noInfo: 'Không có thông tin',
          none: 'Không có',
          position: 'Vị trí',
          coverLetter: 'Thư xin việc',
          resume: 'CV/Resume',
          viewResume: 'Xem CV/Resume'
        },
        alerts: {
          loadFailed: 'Không thể tải danh sách đơn ứng tuyển!',
          sendInterviewSuccess: 'Đã gửi lịch phỏng vấn thành công!',
          sendInterviewFailed: 'Gửi lịch phỏng vấn thất bại!',
          acceptConfirm: 'Bạn có chắc muốn chấp nhận đơn ứng tuyển này không?',
          acceptAgainConfirm: "Bạn có chắc chắn muốn chấp nhận lại đơn ứng tuyển đã bị từ chối này? Hành động này sẽ thay đổi trạng thái từ 'Đã từ chối' thành 'Đã chấp nhận'.",
          acceptSuccess: 'Đã chấp nhận đơn ứng tuyển và gửi email thông báo!',
          acceptAgainSuccess: 'Đã chấp nhận lại đơn ứng tuyển đã bị từ chối và gửi email thông báo!',
          acceptError: 'Có lỗi xảy ra khi chấp nhận đơn ứng tuyển!',
          rejectConfirm: 'Bạn có chắc chắn muốn từ chối đơn ứng tuyển này?',
          rejectAgainConfirm: "Bạn có chắc chắn muốn từ chối đơn ứng tuyển đã được chấp nhận này? Hành động này sẽ thay đổi trạng thái từ 'Đã chấp nhận' thành 'Đã từ chối'.",
          rejectSuccess: 'Đã từ chối đơn ứng tuyển!',
          rejectAgainSuccess: 'Đã từ chối đơn ứng tuyển đã được chấp nhận!',
          rejectError: 'Có lỗi xảy ra khi từ chối đơn ứng tuyển!'
        },
        empty: 'Chưa có đơn ứng tuyển nào'
      },
      recruiterAddJob: {
        headers: {
          title: 'Đăng tin tuyển dụng',
          subtitle: 'Tạo tin tuyển dụng mới'
        },
        labels: {
          title: 'Tiêu đề công việc',
          location: 'Địa điểm',
          description: 'Mô tả công việc',
          salaryVnd: 'Mức lương (VNĐ)',
          quantity: 'Số lượng tuyển',
          expiredAt: 'Ngày hết hạn',
          level: 'Trình độ',
          jobType: 'Loại công việc',
          industry: 'Ngành nghề',
          statusActive: 'Hoạt động'
        },
        placeholders: {
          title: 'Nhập tiêu đề công việc...',
          location: 'Nhập địa điểm...',
          description: 'Nhập mô tả chi tiết công việc...',
          salary: 'Nhập mức lương...',
          quantity: 'Số lượng...'
        },
        options: {
          selectLevel: 'Chọn trình độ',
          selectJobType: 'Chọn loại công việc',
          selectIndustry: 'Chọn ngành nghề'
        },
        recruiterInfo: {
          actingAs: 'Đăng tin với tư cách: {{firstName}} {{lastName}}',
          userId: 'User ID: {{id}}',
          locationId: 'Location ID: {{id}}'
        },
        buttons: {
          submit: 'Đăng tin tuyển dụng',
          cancel: 'Hủy'
        },
        alerts: {
          missingUser: 'Không thể lấy thông tin người dùng. Vui lòng thử lại!',
          createSuccess: 'Đăng tin tuyển dụng thành công!',
          createFailedWithMessage: 'Đăng tin tuyển dụng thất bại: {{message}}',
          createFailed: 'Đăng tin tuyển dụng thất bại!'
        }
      },
      addUser: {
        headers: { title: 'Thêm Người Dùng' },
        sections: {
          applicant: 'Thông Tin Ứng Viên',
          recruiter: 'Thông Tin Nhà Tuyển Dụng',
          location: 'Thông tin địa chỉ',
          education: 'Học vấn'
        },
        labels: {
          username: 'Tên đăng nhập',
          password: 'Mật khẩu',
          email: 'Email',
          firstName: 'Họ',
          lastName: 'Tên',
          phone: 'Số điện thoại',
          role: 'Vai trò',
          provider: 'Nhà cung cấp',
          providerId: 'Provider ID',
          avatar: 'Ảnh đại diện/Tệp',
          chooseImage: 'Chọn ảnh',
          dob: 'Ngày sinh',
          gender: 'Giới tính',
          male: 'Nam',
          female: 'Nữ',
          expYears: 'Số năm kinh nghiệm',
          desiredTitle: 'Vị trí mong muốn',
          skills: 'Kỹ năng',
          bio: 'Giới thiệu bản thân',
          province: 'Tỉnh/Thành phố',
          district: 'Quận/Huyện',
          address: 'Địa chỉ chi tiết',
          notes: 'Ghi chú',
          companyName: 'Tên công ty',
          companyWebsite: 'Website công ty',
          position: 'Vị trí',
          logoUrl: 'Logo URL',
          companyBio: 'Giới thiệu công ty',
          country: 'Quốc gia',
          searchSchool: 'Tìm kiếm trường...',
          degreeTitle: 'Tên bằng cấp',
          year: 'Năm',
          selectSchool: '-- Chọn trường --',
          selectLevel: '-- Chọn bậc học --',
          removeEducation: 'Xóa học vấn'
        },
        placeholders: {
          username: 'Tên đăng nhập',
          password: 'Mật khẩu',
          email: 'Email',
          firstName: 'Họ',
          lastName: 'Tên',
          phone: 'Số điện thoại',
          providerId: 'Provider ID',
          expYears: 'Số năm kinh nghiệm',
          desiredTitle: 'Vị trí mong muốn',
          skills: 'Kỹ năng',
          bio: 'Giới thiệu bản thân',
          province: 'Ví dụ: Hà Nội',
          district: 'Ví dụ: Cầu Giấy',
          address: 'Ví dụ: 123 Đường ABC',
          notes: 'Ghi chú về địa chỉ (tùy chọn)',
          degreeTitle: 'Tên bằng cấp',
          year: 'Năm'
        },
        role: {
          placeholder: '-- Chọn Vai Trò --',
          admin: 'ADMIN',
          moderator: 'MODERATOR',
          recruiter: 'RECRUITER',
          applicant: 'APPLICANT'
        },
        provider: {
          local: 'LOCAL',
          google: 'GOOGLE'
        },
        buttons: {
          submit: 'Thêm Người Dùng',
          addEducation: 'Thêm học vấn'
        },
        alerts: {
          createApplicantLocationFailed: 'Tạo địa chỉ cho ứng viên thất bại: {{message}}',
          createRecruiterLocationFailed: 'Tạo địa chỉ cho nhà tuyển dụng thất bại: {{message}}',
          successAndNotify: 'Thêm người dùng thành công và đã gửi thông báo!',
          successNoToken: 'Thêm người dùng thành công! (Không tìm thấy FCM token để gửi thông báo)',
          notifyFailed: 'Thêm thành công nhưng gửi thông báo thất bại!',
          failed: 'Thêm thất bại.'
        },
        notification: {
          title: 'Thông báo',
          bodySuccess: 'Thêm người dùng thành công!'
        }
      }
    }
  }
};

const savedLang = localStorage.getItem('lng');

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLang || 'vi',
    fallbackLng: 'en',
    interpolation: { escapeValue: false }
  });

export default i18n;
