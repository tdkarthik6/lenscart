import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const client = axios.create({
  baseURL: `${API_BASE}/api`,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('lenscraft_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('lenscraft_token');
      localStorage.removeItem('lenscraft_user');
      window.location.href = '/owner/login';
    }
    return Promise.reject(err);
  }
);

// ─── Auth ─────────────────────────────────────────────────
export const authApi = {
  register: (data) => client.post('/auth/register', data),
  login: (data) => client.post('/auth/login', data),
  ownerLogin: (data) => client.post('/auth/owner/login', data),
  me: () => client.get('/auth/me'),
};

// ─── Services ─────────────────────────────────────────────
export const servicesApi = {
  getAll: (params) => client.get('/services', { params }),
  getById: (id) => client.get(`/services/${id}`),
  create: (data) => client.post('/services', data),
  update: (id, data) => client.put(`/services/${id}`, data),
  toggleStatus: (id, active) => client.patch(`/services/${id}/status`, { active }),
  delete: (id) => client.delete(`/services/${id}`),
};

// ─── Bookings ─────────────────────────────────────────────
export const bookingsApi = {
  checkAvailability: (params) => client.get('/bookings/availability', { params }),
  create: (data) => client.post('/bookings', data),
  myBookings: () => client.get('/bookings/my'),
  myBookingById: (id) => client.get(`/bookings/${id}`),
};

// ─── Owner ────────────────────────────────────────────────
export const ownerApi = {
  dashboard: () => client.get('/owner/dashboard'),
  calendar: (params) => client.get('/owner/calendar', { params }),
  allBookings: (params) => client.get('/owner/bookings', { params }),
  bookingById: (id) => client.get(`/owner/bookings/${id}`),
  updateStatus: (id, status) => client.patch(`/owner/bookings/${id}/status`, { status }),
};

export default client;
