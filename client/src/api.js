const API_URL = 'http://localhost:5000/api';

const getToken = () => localStorage.getItem('token');

const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Something went wrong');
  return data;
};

export const api = {
  // Auth
  register: async (userData) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return handleResponse(res);
  },

  login: async (credentials) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return handleResponse(res);
  },

  // Resources
  getResources: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_URL}/resources?${query}`);
    return handleResponse(res);
  },

  getMyResources: async () => {
    const res = await fetch(`${API_URL}/resources/my`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return handleResponse(res);
  },

  uploadResource: async (formData) => {
    const res = await fetch(`${API_URL}/resources`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${getToken()}` },
      body: formData,
    });
    return handleResponse(res);
  },

  deleteResource: async (id) => {
    const res = await fetch(`${API_URL}/resources/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return handleResponse(res);
  },

  downloadResource: async (id) => {
    const token = getToken();
    const url = `${API_URL}/resources/${id}/download`;
    const link = document.createElement('a');
    link.href = token ? `${url}?token=${token}` : url;
    link.download = true;
    link.click();
  },

  rateResource: async (id, value) => {
    const res = await fetch(`${API_URL}/resources/${id}/rate`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}` 
      },
      body: JSON.stringify({ value }),
    });
    return handleResponse(res);
  },
};