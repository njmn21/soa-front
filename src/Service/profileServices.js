import axios from 'axios';

//const API_BASE_URL = 'http://localhost:8080';
const API_BASE_URL = 'https://gateway-container-app.greenriver-26d96275.eastus2.azurecontainerapps.io';
//const IMAGE_BASE_URL = 'http://localhost:8082/static';
const IMAGE_BASE_URL = 'https://clothing-container-app.greenriver-26d96275.eastus2.azurecontainerapps.io/static';

const cuentaService = {
  // Obtener información del usuario
  obtenerUsuario: async (usuarioId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/usuarios/${usuarioId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener prendas del usuario
  obtenerPrendasUsuario: async (usuarioId) => {
    try {
      //const response = await axios.get(`http://localhost:8080/prendas/usuario/${usuarioId}`);
      const response = await axios.get(`https://gateway-container-app.greenriver-26d96275.eastus2.azurecontainerapps.io/prendas/usuario/${usuarioId}`);
      
      // Procesar las imágenes para tener la URL completa
      const prendasConImagen = response.data.map(prenda => ({
        ...prenda,
        imagen_url: prenda.url_imagen_completa || `${IMAGE_BASE_URL}/${prenda.ruta_imagen}`
      }));
      
      return prendasConImagen;
    } catch (error) {
      // Si no hay prendas, retornar array vacío en lugar de error
      if (error.response?.status === 404) {
        return [];
      }
      throw error;
    }
  },

  // Crear nueva prenda
  crearPrenda: async (prendaData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/prendas/`, prendaData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Actualizar prenda
  actualizarPrenda: async (prendaId, prendaData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/prendas/${prendaId}`, prendaData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Eliminar prenda
  eliminarPrenda: async (prendaId) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/prendas/${prendaId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default cuentaService;