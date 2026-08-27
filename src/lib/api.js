// src/lib/api.js
import { auth } from './firebase';

export const adminFetch = async (path, options = {}) => {
  let token = null;

  if (auth.currentUser) {
    try {
      token = await auth.currentUser.getIdToken(false);
      localStorage.setItem('adminToken', token);
    } catch (err) {
      console.warn('Failed to refresh Firebase token:', err);
    }
  }

  if (!token) {
    token = localStorage.getItem('adminToken');
  }

  const headers = {
    ...options.headers,
    ...(token ? { 'Authorization': \`Bearer ${token}\` } : {})
  };

  const url = \`${import.meta.env.VITE_API_BASE_URL}${path}\`;
  const response = await fetch(url, { ...options, headers });
  
  if (response.status === 401 || response.status === 403) {
    console.error('Admin Auth Error: Token may be expired');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminAuth');
    if (window.location.pathname.includes('/admin')) {
      window.location.reload();
    }
  }

  return response;
};
