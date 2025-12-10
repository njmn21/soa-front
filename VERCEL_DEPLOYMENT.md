# Solución CORS para Despliegue en Vercel

## Problema
La aplicación funciona en local pero tiene errores CORS en Vercel porque el backend en Azure Container Apps no permite solicitudes desde el dominio de Vercel.

## Cambios Realizados

### 1. Configuración Centralizada de API (`src/config/apiConfig.js`)
- Se creó un archivo de configuración centralizado para todas las URLs de API
- Usa variables de entorno cuando están disponibles
- En producción usa rutas relativas (`/api`) que serán manejadas por el proxy de Vercel
- En desarrollo usa `localhost`

### 2. Archivo `vercel.json`
- Configura un proxy que redirige `/api/*` a tu backend en Azure
- Agrega headers CORS necesarios
- Esto evita los errores CORS haciendo que las solicitudes pasen a través de tu dominio de Vercel

### 3. Actualización de Servicios
Todos los archivos de servicios y vistas ahora usan `API_CONFIG`:
- `src/Service/authService.js`
- `src/Service/favoritesService.js`
- `src/Service/profileServices.js`
- `src/Views/Register.jsx`
- `src/Views/Search.jsx`
- `src/Views/ProductDetail.jsx`
- `src/Views/Marketplace.jsx`
- `src/Views/Favorites.jsx`

## Configuración en Vercel

### Opción 1: Despliegue Simple (Recomendado)
Solo necesitas hacer commit y push de estos cambios. El archivo `vercel.json` configurará el proxy automáticamente.

```bash
git add .
git commit -m "Fix CORS issues with proxy configuration"
git push
```

### Opción 2: Con Variables de Entorno (Opcional)
Si quieres más control, puedes configurar variables de entorno en Vercel:

1. Ve a tu proyecto en Vercel Dashboard
2. Settings → Environment Variables
3. Agrega las siguientes variables:

```
REACT_APP_API_BASE_URL=https://gateway-container-app.greenriver-26d96275.eastus2.azurecontainerapps.io
REACT_APP_IMAGE_BASE_URL=https://clothing-container-app.greenriver-26d96275.eastus2.azurecontainerapps.io/static
```

4. Redeploy tu aplicación

### Opción 3: Configurar CORS en el Backend (Solución Permanente)
La mejor solución a largo plazo es configurar CORS en tu API Gateway:

**En tu backend (FastAPI/Python), agrega:**
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://tu-app.vercel.app",  # Tu dominio de Vercel
        "http://localhost:3000",       # Para desarrollo
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Testing Local

Para probar que todo funciona correctamente en local:

```bash
npm start
```

La aplicación debería funcionar igual que antes, usando `localhost:8080` para la API.

## Testing en Producción

Después de desplegar en Vercel:
1. Visita tu URL de Vercel
2. Intenta hacer login o ver productos
3. No deberías ver errores CORS en la consola del navegador

## Estructura de URLs

### Desarrollo (Local)
- Frontend: `http://localhost:3000`
- API Gateway: `http://localhost:8080`
- Image Service: `http://localhost:8082/static`

### Producción (Vercel)
- Frontend: `https://tu-app.vercel.app`
- API Gateway (a través de proxy): `https://tu-app.vercel.app/api` → redirige a Azure
- Image Service (a través de proxy): `https://tu-app.vercel.app/api/static` → redirige a Azure

## Troubleshooting

### Si sigues viendo errores CORS:
1. Verifica que el archivo `vercel.json` está en la raíz del proyecto
2. Asegúrate de que el despliegue se completó correctamente
3. Limpia la caché del navegador
4. Revisa los logs de Vercel para ver si hay errores

### Si las imágenes no cargan:
1. Verifica que las URLs de imagen en `apiConfig.js` son correctas
2. Comprueba que el servicio de imágenes en Azure está funcionando
3. Revisa la configuración del proxy en `vercel.json`

### Si el login no funciona:
1. Verifica que el token se está guardando en localStorage
2. Comprueba la consola del navegador para errores
3. Revisa que el endpoint `/login` está accesible a través del proxy

## Archivos Importantes

- `vercel.json` - Configuración del proxy y headers CORS
- `src/config/apiConfig.js` - Configuración centralizada de URLs
- `.env.example` - Ejemplo de variables de entorno (para desarrollo)

## Notas Adicionales

- El proxy de Vercel solo funciona en producción, no en `vercel dev`
- Para desarrollo local, sigue usando las URLs directas de `localhost`
- Considera usar variables de entorno para diferentes ambientes (desarrollo, staging, producción)
