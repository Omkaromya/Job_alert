export const AUTH_ENDPOINTS = {
  register: `/api/v1/auth/register`,
  login: `/api/v1/auth/login`,
  me: `/api/v1/auth/me`,
  myRole: `/api/v1/auth/my-role`,
  checkRole: (role) => `/api/v1/auth/check-role/${role}`,
  verifyEmail: `/api/v1/auth/verify-email`,
  resendOtp: `/api/v1/auth/resend-otp`,
  forgotPassword: `/api/v1/auth/forgot-password-otp`,
  resetPassword: `/api/v1/auth/reset-password`,
  checkEmail: `/api/v1/auth/check-email`
};

export const JOBS_ENDPOINTS = {
  create: `/api/v1/jobs/`,
  list: `/api/v1/jobs/`,
  detail: (id) => `/api/v1/jobs/${id}/`,
  myJobs: `/api/v1/jobs/my-jobs/`
};

export const USER_ENDPOINTS = {
  list: `/api/v1/users/users`,
  detail: (id) => `/api/v1/users/users/${id}`,
  profile: `/api/v1/users/profile`
};

export const NOTIFICATIONS_ENDPOINTS = {
  list: `/api/v1/notifications/`,
  markAsRead: (id) => `/api/v1/notifications/${id}/read`,
  markAllAsRead: `/api/v1/notifications/read-all`
};


