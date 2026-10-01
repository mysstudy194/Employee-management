import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5206/api',
});

// Request interceptor: Har API call ke sath automatic Bearer token send karega
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;