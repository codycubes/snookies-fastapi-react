export const API_URL = 'http://localhost:8000';

export const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? `Bearer ${token}` : '';
}; 