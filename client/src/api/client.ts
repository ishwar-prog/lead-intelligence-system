import axios from 'axios';

/**
 * Single Axios instance, configured once, imported everywhere
 *
 * Professor Note:
 * Same Adapter principle from the backend, applied here. Every API
 * call in this app goes through this one configured instance. If you
 * need to add an auth header later (e.g. JWT token), you add it here
 * ONCE via an interceptor — not in 10 different component files.
 */
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

export default apiClient;