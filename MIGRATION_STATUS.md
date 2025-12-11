# Estado de la Migración a Arquitectura Separada

## ✅ Completado

### Backend API (100%)
- ✅ Estructura de carpetas creada (`backend/`)
- ✅ Configuración centralizada (`config.py`)
- ✅ API REST completa con JWT (`app.py`)
- ✅ Endpoints implementados:
  - `POST /api/auth/register` - Registro con upload de archivo
  - `POST /api/auth/login` - Login con JWT
  - `GET /api/auth/me` - Obtener usuario actual
  - `GET /api/admin/users` - Listar usuarios (admin)
  - `POST /api/admin/users/:id/approve` - Aprobar usuario
  - `POST /api/admin/users/:id/disable` - Deshabilitar usuario
  - `DELETE /api/admin/users/:id` - Eliminar usuario
  - `PUT /api/admin/users/:id/role` - Cambiar rol
  - `GET /api/uploads/:filename` - Servir archivos
  - `GET /api/health` - Health check
- ✅ CORS configurado
- ✅ Sistema de correos mantenido
- ✅ Dockerfile para backend
- ✅ Script `create_admin.py`
- ✅ Requirements.txt actualizado

### Frontend React (Estructura Básica - 30%)
- ✅ Estructura de carpetas creada
- ✅ `package.json` configurado
- ✅ `vite.config.js` con proxy
- ✅ `index.html` base
- ⏳ Pendiente: Componentes React
- ⏳ Pendiente: Páginas (Home, Login, Register, Admin, Matrix)
- ⏳ Pendiente: Servicios API (axios)
- ⏳ Pendiente: Context de autenticación
- ⏳ Pendiente: Estilos CSS migrados

## 📋 Próximos Pasos

### 1. Completar Frontend React
Necesitas crear:

#### Servicios API (`frontend/src/services/api.js`)
```javascript
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Interceptor para añadir token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (formData) => api.post('/auth/register', formData),
  getCurrentUser: () => api.get('/auth/me'),
};

export const adminService = {
  getUsers: () => api.get('/admin/users'),
  approveUser: (id) => api.post(`/admin/users/${id}/approve`),
  disableUser: (id) => api.post(`/admin/users/${id}/disable`),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  changeRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
};

export default api;
```

#### Context de Autenticación (`frontend/src/context/AuthContext.jsx`)
```javascript
import { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      authService.getCurrentUser()
        .then(res => setUser(res.data))
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await authService.login(email, password);
    localStorage.setItem('token', res.data.access_token);
    setUser(res.data.user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

#### Páginas Principales
- `frontend/src/pages/Home.jsx` - Página principal (migrar de `index.html`)
- `frontend/src/pages/Login.jsx` - Login con formulario
- `frontend/src/pages/Register.jsx` - Registro con upload
- `frontend/src/pages/Admin.jsx` - Panel admin
- `frontend/src/pages/Matrix.jsx` - Página secreta

#### App Principal (`frontend/src/App.jsx`)
```javascript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Admin from './pages/Admin';
import Matrix from './pages/Matrix';

const PrivateRoute = ({ children, adminOnly }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Cargando...</div>;
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" />;
  if (!user.is_enabled) return <Navigate to="/" />;
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={
            <PrivateRoute adminOnly>
              <Admin />
            </PrivateRoute>
          } />
          <Route path="/matrix" element={
            <PrivateRoute>
              <Matrix />
            </PrivateRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
```

### 2. Migrar Estilos CSS
Copiar los estilos de `static/css/style.css` a `frontend/src/assets/css/style.css` y adaptarlos.

### 3. Docker Compose
Crear `docker-compose.yml` en la raíz:

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    volumes:
      - ./backend/instance:/app/instance
      - ./backend/uploads:/app/uploads
    env_file:
      - ./backend/.env
    environment:
      - CORS_ORIGINS=http://localhost:5173,http://localhost:3000

  frontend:
    build: ./frontend
    ports:
      - "5173:80"
    environment:
      - VITE_API_URL=http://localhost:5000/api
    depends_on:
      - backend
```

### 4. Dockerfile Frontend
Crear `frontend/Dockerfile`:

```dockerfile
FROM node:20-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 🚀 Cómo Probar el Backend Ahora

```bash
cd backend
pip install -r requirements.txt
python create_admin.py
python app.py
```

El backend estará en `http://localhost:5000`

Prueba con curl:
```bash
# Health check
curl http://localhost:5000/api/health

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"rafaguzmanrodri@gmail.com","password":"admin"}'
```

## 📝 Notas Importantes

1. **El backend está 100% funcional** como API REST
2. **El frontend necesita ser completado** con React
3. **Los estilos CSS** deben migrarse manualmente
4. **Las imágenes** en `static/assets` deben copiarse a `frontend/public`

## ¿Quieres que continúe?

Puedo:
1. ✅ Completar todos los componentes React del frontend
2. ✅ Migrar los estilos CSS
3. ✅ Crear el docker-compose completo
4. ✅ Documentar el nuevo despliegue

¿Procedo con esto o prefieres probar el backend primero?
