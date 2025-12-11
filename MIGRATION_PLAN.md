# Plan de Migración a Arquitectura Separada

## Estructura Final del Proyecto

```
barbecue/
├── backend/                    # API REST con Flask
│   ├── app.py
│   ├── models.py
│   ├── config.py
│   ├── auth.py                # JWT authentication
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── auth_routes.py
│   │   ├── user_routes.py
│   │   └── admin_routes.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── instance/
│       └── barbecue.db
│
├── frontend/                   # React + Vite
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/          # API calls
│   │   ├── context/           # Auth context
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   └── Dockerfile
│
└── docker-compose.yml          # Orquestación completa
```

## Pasos de Implementación

### Fase 1: Preparar Backend API
1. Crear estructura de carpetas backend
2. Instalar Flask-JWT-Extended y Flask-CORS
3. Convertir rutas a endpoints JSON
4. Implementar autenticación JWT
5. Actualizar manejo de archivos (multipart/form-data)

### Fase 2: Crear Frontend React
1. Inicializar proyecto Vite + React
2. Configurar Axios para API calls
3. Crear componentes reutilizables
4. Implementar páginas (Home, Login, Register, Admin, Matrix)
5. Gestión de autenticación con Context API
6. Migrar estilos CSS

### Fase 3: Integración
1. Configurar CORS en backend
2. Probar flujo completo de autenticación
3. Probar upload de archivos
4. Configurar variables de entorno

### Fase 4: Despliegue
1. Dockerizar ambos servicios
2. Crear docker-compose.yml
3. Actualizar documentación
4. Guías de despliegue separado (Backend: Railway, Frontend: Vercel)

## Cambios Principales

### Backend
- **Antes**: Renderiza HTML con Jinja2
- **Después**: Retorna JSON, sin templates

### Frontend  
- **Antes**: HTML estático servido por Flask
- **Después**: SPA React que consume API

### Autenticación
- **Antes**: Flask-Login con sesiones
- **Después**: JWT tokens en localStorage

### Archivos
- **Antes**: Flask maneja uploads directamente
- **Después**: API endpoint multipart, frontend envía FormData
