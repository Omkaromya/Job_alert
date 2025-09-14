import { USER_ENDPOINTS } from '../config';

async function requestJson(url, options) {
  const resp = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
    ...options
  });
  const text = await resp.text();
  const data = text ? JSON.parse(text) : null;
  if (!resp.ok) {
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

function getToken() {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No token available');
  }
  return token;
}

export async function getUsers({ skip = 0, limit = 10, search = '' } = {}) {
  const token = getToken();
  const params = new URLSearchParams();
  params.append('skip', skip);
  params.append('limit', limit);
  if (search) {
    params.append('search', search);
  }
  const url = `${USER_ENDPOINTS.list}?${params.toString()}`;
  return requestJson(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
}

export async function updateUser(userId, data) {
  const token = getToken();
  const url = USER_ENDPOINTS.detail(userId);
  return requestJson(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
}

export async function deleteUser(userId) {
  const token = getToken();
  const url = USER_ENDPOINTS.detail(userId);
  return requestJson(url, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
}

export async function saveProfile(profileData) {
  const token = getToken();
  const url = USER_ENDPOINTS.profile;
  return requestJson(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(profileData)
  });
}

export async function getProfile(userId = null) {
  const token = getToken();
  let url = USER_ENDPOINTS.profile;
  if (userId) {
    url += `?user_id=${userId}`;
  }
  return requestJson(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
}

export async function getUserDetail(userId) {
  const token = getToken();
  const url = USER_ENDPOINTS.detail(userId);
  return requestJson(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
}
