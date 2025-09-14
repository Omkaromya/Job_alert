const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api/v1';

async function getAuthToken() {
  return localStorage.getItem('token');
}

export async function getNotifications(skip = 0, limit = 20) {
  const token = await getAuthToken();
  const response = await fetch(`${API_BASE_URL}/notifications/?skip=${skip}&limit=${limit}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch notifications');
  }
  return response.json();
}

export async function markNotificationAsRead(notificationId) {
  const token = await getAuthToken();
  const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error('Failed to mark notification as read');
  }
  return response.json();
}

export async function markAllNotificationsAsRead() {
  const token = await getAuthToken();
  const response = await fetch(`${API_BASE_URL}/notifications/read_all`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error('Failed to mark all notifications as read');
  }
  return response.json();
}
