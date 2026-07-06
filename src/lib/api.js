// src/lib/api.js
export const adminFetch = async (path, options = {}) => {
  const token = sessionStorage.getItem('adminToken');
  const headers = {
    ...options.headers,
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };

  const url = `${import.meta.env.VITE_API_BASE_URL}${path}`;
  const response = await fetch(url, { ...options, headers });
  
  if (response.status === 401 || response.status === 403) {
    // Optionally trigger a logout or redirect here
    console.error("Admin Auth Error: Token may be expired");
    sessionStorage.removeItem('adminToken');
    sessionStorage.removeItem('adminAuth');
    window.location.reload();
  }

  return response;
};
