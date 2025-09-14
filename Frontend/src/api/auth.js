import { AUTH_ENDPOINTS, JOBS_ENDPOINTS, USER_ENDPOINTS } from '../config';

async function requestJson(url, options) {
  const resp = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
    ...options
  });
  const text = await resp.text();
  const data = text ? JSON.parse(text) : null;
  if (!resp.ok) {
    // If 404 and missing trailing slash (common in DRF), retry once with slash
    if (resp.status === 404 && typeof url === 'string' && !url.endsWith('/')) {
      const retryUrl = url + '/';
      const retryResp = await fetch(retryUrl, {
        headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
        ...options
      });
      const retryText = await retryResp.text();
      const retryData = retryText ? JSON.parse(retryText) : null;
      if (retryResp.ok) return retryData;
      const retryError = new Error(retryData?.message || 'Request failed');
      retryError.status = retryResp.status;
      retryError.data = retryData;
      throw retryError;
    }
    const error = new Error(data?.message || 'Request failed');
    error.status = resp.status;
    error.data = data;
    throw error;
  }
  return data;
}

export async function registerUser(payload) {
  return requestJson(AUTH_ENDPOINTS.register, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function verifyEmail(payload) {
  // Try different payload formats that backends commonly expect
  const backendPayloads = [
    // Format 1: Current format
    { email: payload.email, otp: payload.otp },
    // Format 2: Alternative field names
    { email: payload.email, verification_code: payload.otp },
    { email: payload.email, code: payload.otp },
    { email: payload.email, token: payload.otp },
    // Format 3: With user_id if available
    { email: payload.email, otp: payload.otp, user_id: payload.user_id }
  ];
  
  // Try each format until one works
  for (const backendPayload of backendPayloads) {
    try {
      const response = await fetch(AUTH_ENDPOINTS.verifyEmail, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backendPayload)
      });
      
      if (response.ok) {
        const data = await response.json();
        return data;
      }
      
      // If 400 error, try next format
      if (response.status === 400) {
        console.log(`Trying next format for verify-email...`);
        continue;
      }
      
      // For other errors, throw immediately
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData?.message || 'Verification failed');
      error.status = response.status;
      error.data = errorData;
      throw error;
      
    } catch (err) {
      // If it's a network error or non-400 status, throw it
      if (err.status && err.status !== 400) {
        throw err;
      }
      // For 400 errors, continue to next format
      continue;
    }
  }
  
  // If all formats failed, throw the last error
  throw new Error('Email verification failed - all payload formats rejected');
}

export async function resendOtp(payload) {
  return requestJson(AUTH_ENDPOINTS.resendOtp, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function loginUser(form) {
  const body = new URLSearchParams();
  body.set('username', form.username);
  body.set('password', form.password);
  const resp = await fetch(AUTH_ENDPOINTS.login, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body
  });
  const text = await resp.text();
  const data = text ? JSON.parse(text) : null;
  if (!resp.ok) {
    const error = new Error(data?.message || 'Login failed');
    error.status = resp.status;
    error.data = data;
    throw error;
  }
  return data;
}

export async function getMyRole() {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No token available');
  }

  return requestJson(AUTH_ENDPOINTS.myRole, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
}

export async function getCurrentUser() {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No token available');
  }

  return requestJson(AUTH_ENDPOINTS.me, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
}

export async function checkUserRole(role) {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No token available');
  }

  return requestJson(AUTH_ENDPOINTS.checkRole(role), {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
}

export async function getUserProfile() {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No token available');
  }

  return requestJson(USER_ENDPOINTS.profile, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
}

// Job Management APIs
export async function createJob(jobData) {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No token available');
  }

  return requestJson(JOBS_ENDPOINTS.create, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(jobData)
  });
}

export async function updateJob(jobId, jobData) {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No token available');
  }

  return requestJson(JOBS_ENDPOINTS.detail(jobId), {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(jobData)
  });
}

export async function deleteJob(jobId) {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No token available');
  }

  return requestJson(JOBS_ENDPOINTS.detail(jobId), {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
}

export async function getJobs(filters = {}) {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No token available');
  }

  const queryParams = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, value);
    }
  });

  const url = `${JOBS_ENDPOINTS.list}?${queryParams.toString()}`;
  
  return requestJson(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
}

export async function getMyJobs(filters = {}) {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No token available');
  }

  const queryParams = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, value);
    }
  });

  const url = `${JOBS_ENDPOINTS.myJobs}?${queryParams.toString()}`;
  
  return requestJson(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
}

export async function getJobById(jobId) {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No token available');
    }
  
  return requestJson(JOBS_ENDPOINTS.detail(jobId), {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
}

export async function forgotPassword(payload) {
  return requestJson(AUTH_ENDPOINTS.forgotPassword, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function resetPassword(payload) {
  return requestJson(AUTH_ENDPOINTS.resetPassword, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}


