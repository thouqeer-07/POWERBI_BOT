import axios from 'axios';

const API_URL = 'http://localhost:8001';

const fetchWithAuth = async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');
    const headers = {
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;
    
    // AXIOS INSTANCE WITH AUTH
    return axios({
        url,
        method: options.method || 'GET',
        headers,
        data: options.body || options.data,
        ...options
    });
};

const api = {
    get: (url, options) => fetchWithAuth(url, { ...options, method: 'GET' }),
    post: (url, data, options) => fetchWithAuth(url, { ...options, method: 'POST', data }),
    put: (url, data, options) => fetchWithAuth(url, { ...options, method: 'PUT', data }),
    delete: (url, options) => fetchWithAuth(url, { ...options, method: 'DELETE' }),
};

export default api;
export { API_URL };
