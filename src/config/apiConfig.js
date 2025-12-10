// Configuración centralizada de APIs
const API_CONFIG = {
  // API Gateway URL
  BASE_URL: process.env.REACT_APP_API_BASE_URL || 
    (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:8080'),
  
  // Image service URL  
  IMAGE_BASE_URL: process.env.REACT_APP_IMAGE_BASE_URL || 
    (process.env.NODE_ENV === 'production' ? '/api/static' : 'http://localhost:8082/static'),
    
  // URLs para desarrollo local
  GATEWAY_DEV_URL: 'http://localhost:8080',
  IMAGE_DEV_URL: 'http://localhost:8082/static',
  
  // URLs para producción directa (solo si es necesario)
  GATEWAY_PROD_URL: 'https://gateway-container-app.greenriver-26d96275.eastus2.azurecontainerapps.io',
  IMAGE_PROD_URL: 'https://clothing-container-app.greenriver-26d96275.eastus2.azurecontainerapps.io/static'
};

export default API_CONFIG;