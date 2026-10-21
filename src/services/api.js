/**
 * MedScan API Client
 * Secure communication with the Express backend
 */

const TOKEN_KEY = 'medscan_auth_token';

export function getStoredToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || '';
  } catch {
    return '';
  }
}

export function setStoredToken(token) {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    // Ignore storage errors
  }
}

async function request(url, options = {}) {
  const token = getStoredToken();
  const headers = {
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    headers['x-user-id'] = token;
  }

  const config = {
    ...options,
    credentials: 'include',
    headers,
  };

  if (config.body && !(config.body instanceof FormData) && typeof config.body === 'object') {
    headers['Content-Type'] = 'application/json';
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(url, config);
  const data = await response.json().catch(() => ({
    success: false,
    error: { message: 'Unexpected server response format.' },
  }));

  if (!response.ok || data.success === false) {
    const errorMsg = data?.error?.message || data?.error || 'Request failed';
    const err = new Error(errorMsg);
    err.status = response.status;
    err.data = data;
    throw err;
  }

  // If user token returned in response, save it
  if (data?.data?.token) {
    setStoredToken(data.data.token);
  } else if (data?.data?.user?.id && !token) {
    setStoredToken(data.data.user.id);
  }

  return data;
}

export const api = {
  // Authentication
  auth: {
    register: async (body) => {
      const res = await request('/api/auth/register', { method: 'POST', body });
      if (res.data?.user?.id) setStoredToken(res.data.user.id);
      return res;
    },
    login: async (body) => {
      const res = await request('/api/auth/login', { method: 'POST', body });
      if (res.data?.user?.id) setStoredToken(res.data.user.id);
      return res;
    },
    logout: async () => {
      try {
        await request('/api/auth/logout', { method: 'POST' });
      } finally {
        setStoredToken(null);
      }
    },
    me: async () => {
      const res = await request('/api/auth/me', { method: 'GET' });
      if (res.data?.user?.id) setStoredToken(res.data.user.id);
      return res;
    },
    forgotPassword: (email) => request('/api/auth/forgot-password', { method: 'POST', body: { email } }),
  },

  // Reports
  reports: {
    list: () => request('/api/reports', { method: 'GET' }),
    get: (id) => request(`/api/reports/${id}`, { method: 'GET' }),
    upload: (formData) => request('/api/reports/upload', { method: 'POST', body: formData }),
    delete: (id) => request(`/api/reports/${id}`, { method: 'DELETE' }),
    deleteAll: () => request('/api/reports', { method: 'DELETE' }),
    compare: (ids) => request(`/api/reports/compare?ids=${encodeURIComponent(ids.join(','))}`, { method: 'GET' }),
    downloadUrl: (id) => `/api/reports/${id}/download`,
  },

  // Assistant
  assistant: {
    listConversations: () => request('/api/assistant/conversations', { method: 'GET' }),
    createConversation: (title, reportId) => request('/api/assistant/conversations', { 
      method: 'POST', 
      body: { title, report_id: reportId } 
    }),
    getMessages: (conversationId) => request(`/api/assistant/conversations/${conversationId}/messages`, { method: 'GET' }),
    sendMessage: (conversationId, message, reportId) => request(`/api/assistant/conversations/${conversationId || 'new'}/messages`, {
      method: 'POST',
      body: { message, report_id: reportId },
    }),
    deleteConversation: (conversationId) => request(`/api/assistant/conversations/${conversationId}`, { method: 'DELETE' }),
  },

  // Profile
  profile: {
    get: () => request('/api/profile', { method: 'GET' }),
    update: (data) => request('/api/profile', { method: 'PUT', body: data }),
  },
};

export default api;
