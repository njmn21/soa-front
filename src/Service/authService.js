import axios from 'axios';

//const API_GATEWAY_URL = 'http://localhost:8080';
const API_GATEWAY_URL = 'https://gateway-container-app.greenriver-26d96275.eastus2.azurecontainerapps.io';

const authService = {
  login: async (email, password) => {
    try {      
      const response = await axios.post(`${API_GATEWAY_URL}/login`, {
        email: email,
        password: password
      }, {
        timeout: 10000
      });
      
      if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {      
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          'Authentication error';
      throw new Error(errorMessage);
    }
  },

  verifyToken: async () => {
    try {
      const token = authService.getToken();
      if (!token) return false;

      // Puedes implementar verificación con el backend si lo necesitas
      return true;
    } catch (error) {
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    return !!token;
  },

  getToken: () => {
    return localStorage.getItem('token');
  },

  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  getUserInfo: async () => {
    try {
      const response = await axios.get(`${API_GATEWAY_URL}/api/usuarios/activos`);
      return response.data;
    } catch (error) {
      return null;
    }
  }
};

export default authService;