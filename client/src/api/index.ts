import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('evara_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('evara_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

// ── Auth ──────────────────────────────────────────
export const authAPI = {
  register: (data: { name: string; email: string; password: string; organization?: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};

// ── Events ────────────────────────────────────────
export const eventsAPI = {
  list: (params?: Record<string, string | number>) => api.get('/events', { params }),
  stats: () => api.get('/events/stats'),
  get: (id: string) => api.get(`/events/${id}`),
  create: (data: Record<string, unknown>) => api.post('/events', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/events/${id}`, data),
  delete: (id: string) => api.delete(`/events/${id}`),
  addAgenda: (id: string, item: Record<string, unknown>) => api.post(`/events/${id}/agenda`, item),
};

// ── Guests ────────────────────────────────────────
export const guestsAPI = {
  list: (params?: Record<string, string>) => api.get('/guests', { params }),
  create: (data: Record<string, unknown>) => api.post('/guests', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/guests/${id}`, data),
  delete: (id: string) => api.delete(`/guests/${id}`),
  bulk: (data: { guests: Record<string, unknown>[]; eventId?: string }) => api.post('/guests/bulk', data),
};

// ── AI ────────────────────────────────────────────
export const aiAPI = {
  chat: (messages: { role: string; content: string }[], eventContext?: Record<string, unknown>) =>
    api.post('/ai/chat', { messages, eventContext }),
  generateEvent: (prompt: string) => api.post('/ai/generate-event', { prompt }),
  generateAgenda: (eventId: string, duration?: number, focus?: string) =>
    api.post('/ai/generate-agenda', { eventId, duration, focus }),
  suggestVenues: (data: { city: string; guests: number; category: string; budget: number }) =>
    api.post('/ai/suggest-venues', data),
  analyze: () => api.post('/ai/analyze'),
};
