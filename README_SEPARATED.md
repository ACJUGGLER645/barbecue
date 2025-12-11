# 🔥 Dev Barbecue - ETITC (Arquitectura Separada)

Sistema de gestión de eventos con arquitectura Frontend/Backend separada.

## 🏗️ Arquitectura

```
┌─────────────┐      HTTP/JSON      ┌─────────────┐
│   React     │ ◄──────────────────► │   Flask     │
│  Frontend   │      REST API        │   Backend   │
│  (Port 80)  │                      │ (Port 5000) │
└─────────────┘                      └─────────────┘
                                            │
                                            ▼
                                     ┌─────────────┐
                                     │   SQLite/   │
                                     │  PostgreSQL │
                                     └─────────────┘
```

## 📦 Estructura del Proyecto

```
barbecue/
├── backend/                 # API REST con Flask
│   ├── app.py              # API principal
│   ├── config.py           # Configuración
│   ├── models.py           # Modelos de DB
│   ├── create_admin.py     # Script admin
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── instance/           # Base de datos
│   └── uploads/            # Archivos subidos
│
├── frontend/                # SPA con React
│   ├── src/
│   │   ├── components/     # Componentes reutilizables
│   │   ├── pages/          # Páginas (Home, Login, etc.)
│   │   ├── services/       # API calls (Axios)
│   │   ├── context/        # Auth context
│   │   ├── assets/         # CSS, imágenes
│   │   ├── App.jsx         # App principal
│   │   └── main.jsx        # Punto de entrada
│   ├── public/             # Archivos estáticos
│   ├── package.json
│   ├── vite.config.js
│   ├── Dockerfile
│   └── nginx.conf
│
└── docker-compose.yml       # Orquestación completa
```

## 🚀 Inicio Rápido

### Opción 1: Con Docker Compose (Recomendado)

```bash
# 1. Clonar repositorio
git clone https://github.com/ACJUGGLER645/barbecue.git
cd barbecue

# 2. Configurar variables de entorno del backend
cp backend/.env.example backend/.env
# Edita backend/.env con tus credenciales de correo

# 3. Levantar todo con Docker Compose
docker-compose up -d

# 4. Crear usuario admin
docker-compose exec backend python create_admin.py

# 5. Acceder
# Frontend: http://localhost
# Backend API: http://localhost:5000
```

### Opción 2: Desarrollo Local

#### Backend
```bash
cd backend
pip install -r requirements.txt
python create_admin.py
python app.py
# Corre en http://localhost:5000
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
# Corre en http://localhost:5173
```

## 🔧 Configuración

### Backend (.env)
```env
SECRET_KEY=tu_clave_secreta
JWT_SECRET_KEY=tu_jwt_secret
MAIL_USERNAME=tu_correo@gmail.com
MAIL_PASSWORD=tu_contraseña_app_gmail
MAIL_DEFAULT_SENDER=tu_correo@gmail.com
```

### Frontend (.env.example → .env)
```env
VITE_API_URL=http://localhost:5000/api
```

## 📡 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro con comprobante
- `POST /api/auth/login` - Login (retorna JWT)
- `GET /api/auth/me` - Usuario actual

### Admin (requiere JWT + role=admin)
- `GET /api/admin/users` - Listar usuarios
- `POST /api/admin/users/:id/approve` - Aprobar usuario
- `POST /api/admin/users/:id/disable` - Deshabilitar usuario
- `DELETE /api/admin/users/:id` - Eliminar usuario
- `PUT /api/admin/users/:id/role` - Cambiar rol

### Archivos
- `GET /api/uploads/:filename` - Obtener comprobante (requiere JWT)

## 🧪 Probar la API

```bash
# Health check
curl http://localhost:5000/api/health

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@barbecue.com","password":"admin"}'

# Obtener usuario actual (con token)
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

## 🎨 Características del Frontend

- ✅ **React 18** con Hooks
- ✅ **React Router** para navegación
- ✅ **Axios** para peticiones HTTP
- ✅ **Context API** para autenticación global
- ✅ **Vite** para desarrollo rápido
- ✅ **Diseño Glassmorphism** mantenido
- ✅ **Modo Oscuro/Claro**
- ✅ **Responsive Design**

## 🐳 Despliegue

### Desarrollo
```bash
docker-compose up
```

### Producción

#### Backend (Railway/Render)
1. Conecta el repositorio
2. Configura build context: `backend/`
3. Añade variables de entorno
4. Configura volumen persistente para `/app/instance`

#### Frontend (Vercel/Netlify)
1. Conecta el repositorio
2. Build command: `cd frontend && npm run build`
3. Output directory: `frontend/dist`
4. Variable de entorno: `VITE_API_URL=https://tu-backend.com/api`

## 📝 Diferencias con Versión Monolítica

| Aspecto | Monolítica | Separada |
|---------|-----------|----------|
| **Autenticación** | Flask-Login (sesiones) | JWT tokens |
| **Frontend** | Jinja2 templates | React SPA |
| **API** | Renderiza HTML | Retorna JSON |
| **Despliegue** | Un solo servidor | Frontend + Backend separados |
| **Escalabilidad** | Limitada | Independiente por servicio |

## 🔒 Seguridad

- JWT para autenticación stateless
- CORS configurado
- Contraseñas hasheadas (pbkdf2:sha256)
- Validación de archivos subidos
- Headers de seguridad en nginx

## 🛠️ Comandos Útiles

```bash
# Ver logs
docker-compose logs -f

# Reiniciar servicios
docker-compose restart

# Reconstruir imágenes
docker-compose up --build

# Detener todo
docker-compose down

# Limpiar volúmenes
docker-compose down -v
```

## 📚 Documentación Adicional

- [DEPLOY.md](DEPLOY.md) - Guía de despliegue detallada
- [MIGRATION_STATUS.md](MIGRATION_STATUS.md) - Estado de la migración
- [GUIA_EMAIL_SMTP.md](GUIA_EMAIL_SMTP.md) - Configuración de correo

## 🤝 Contribuir

1. Fork el proyecto
2. Crea tu rama (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📞 Soporte

- Rafael: 302 423 2284
- Alejandro: 310 481 2234

## 📄 Licencia

Proyecto educativo - ETITC 2025
