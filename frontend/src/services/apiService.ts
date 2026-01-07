const API_URL = import.meta.env.VITE_API_URL;

// Helper for JSON requests (with auth token)
const jsonFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('authToken');

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }

  return data;
};

// Helper for FormData (multipart) requests (no Content-Type header, browser sets it with boundary)
const formDataFetch = async (endpoint: string, formData: FormData, method: 'POST' | 'PUT' = 'POST') => {
  const token = localStorage.getItem('authToken');

  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      // Do NOT set Content-Type — let browser set it with boundary
    },
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Upload failed');
  }

  return data;
};

export const apiService = {
  // ✅ GET ALL PROFILES
  getProfiles: async (): Promise<any[]> => {
    const res = await jsonFetch('/profiles');
    return Array.isArray(res.data) ? res.data : res; // adjust based on your backend response shape
  },

  // ✅ GET SINGLE PROFILE
  getProfileById: async (id: string) => {
    const res = await jsonFetch(`/profiles/${id}`);
    return res.data || res;
  },

  // ✅ INCREMENT CONTACT CLICK (with auth)
  incrementContactClick: async (id: string) => {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_URL}/profiles/${id}/click`, {
      method: 'PATCH',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to increment contact click');
    }

    return response.json();
  },

  // ✅ DELETE PROFILE (admin only)
  deleteProfile: async (id: string) => {
    return jsonFetch(`/profiles/${id}`, { method: 'DELETE' });
  },

  // ✅ CREATE PROFILE (with image upload)
  createProfile: async (formData: FormData) => {
    return formDataFetch('/profiles', formData, 'POST');
  },

  // ✅ UPDATE PROFILE (with image upload)
  updateProfile: async (id: string, formData: FormData) => {
    return formDataFetch(`/profiles/${id}`, formData, 'PUT');
  },
};