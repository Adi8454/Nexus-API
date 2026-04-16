const API_URL = '/api/v1';

export const apiFetch = async (endpoint: string, options: any = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong');
  }

  return data;
};

export const authApi = {
  login: (credentials: any) => apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData: any) => apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
};

export const projectApi = {
  getAll: () => apiFetch('/projects'),
  create: (project: any) => apiFetch('/projects', { method: 'POST', body: JSON.stringify(project) }),
  update: (id: number, project: any) => apiFetch(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(project) }),
  delete: (id: number) => apiFetch(`/projects/${id}`, { method: 'DELETE' }),
};

export const adminApi = {
  getStats: () => apiFetch('/admin/stats'),
};
