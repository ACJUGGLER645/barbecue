# 🔥 Dev Barbecue - ETITC

Sistema de gestión de eventos con registro de usuarios y verificación de pagos.

## 📋 Descripción

Aplicación web Flask para gestionar el acceso a eventos mediante:
- Registro de usuarios con comprobante de pago
- Panel de administración para aprobar/rechazar usuarios
- Sistema de notificaciones por correo electrónico
- Visualización de ubicación secreta del evento (solo usuarios aprobados)

## 🚀 Características

- ✅ **Registro con Comprobante**: Los usuarios suben una imagen de su pago
- 📧 **Notificaciones Automáticas**: Correos al registrarse, aprobarse o deshabilitarse
- 👨‍💼 **Panel Admin**: Gestión completa de usuarios (aprobar, deshabilitar, eliminar, cambiar roles)
- 🔒 **Autenticación**: Sistema de login con Flask-Login
- 🎨 **Diseño Moderno**: Interfaz con glassmorphism y modo oscuro
- 🐳 **Docker Ready**: Listo para desplegar en contenedores

## 🛠️ Stack Tecnológico

- **Backend**: Python 3.11 + Flask
- **Base de Datos**: SQLite (desarrollo) / PostgreSQL (producción)
- **Autenticación**: Flask-Login
- **Email**: Flask-Mail (SMTP)
- **Frontend**: HTML5, CSS3, JavaScript vanilla
- **Servidor**: Gunicorn
- **Contenedores**: Docker

## 📦 Instalación Local

### Requisitos Previos
- Python 3.11+
- Docker (opcional)

### Paso 1: Clonar el Repositorio
```bash
git clone https://github.com/ACJUGGLER645/barbecue.git
cd barbecue
```

### Paso 2: Instalar Dependencias
```bash
pip install -r requirements.txt
```

### Paso 3: Configurar Variables de Entorno
Crea un archivo `.env` en la raíz del proyecto:

```env
SECRET_KEY=tu_clave_secreta_aqui
DATABASE_URL=sqlite:///instance/barbecue.db

# Configuración de Correo (SMTP Gmail)
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME=tu_correo@gmail.com
MAIL_PASSWORD=tu_contraseña_de_aplicacion
MAIL_DEFAULT_SENDER=tu_correo@gmail.com
```

> **Nota**: Para obtener la contraseña de aplicación de Gmail, consulta [GUIA_EMAIL_SMTP.md](GUIA_EMAIL_SMTP.md)

### Paso 4: Crear Usuario Administrador
```bash
python3 create_admin_script.py
```

O usa el comando CLI de Flask:
```bash
flask create-admin
```

### Paso 5: Ejecutar la Aplicación
```bash
python app.py
```

La aplicación estará disponible en `http://localhost:5000`

## 🐳 Despliegue con Docker

### Desarrollo Local

```bash
# Limpiar archivos temporales de macOS
find . -name "._*" -type f -delete

# Construir la imagen
docker build -t barbecue-app .

# Ejecutar el contenedor
docker run -d -p 5001:5000 \
  -v $(pwd)/instance:/app/instance \
  -v $(pwd)/uploads:/app/uploads \
  --env-file .env \
  --name barbecue-container barbecue-app
```

Accede en `http://localhost:5001`

### Producción (Railway/Render)

#### Railway
1. Conecta tu repositorio de GitHub
2. Railway detectará automáticamente el `Dockerfile`
3. Configura las variables de entorno en el dashboard:
   - `SECRET_KEY`
   - `MAIL_USERNAME`
   - `MAIL_PASSWORD`
   - `MAIL_DEFAULT_SENDER`
   - (Opcional) `DATABASE_URL` para PostgreSQL

4. **Importante**: Configura un volumen persistente para `/app/instance` y `/app/uploads`

#### Render
1. Crea un nuevo Web Service
2. Conecta el repositorio
3. Configura:
   - **Build Command**: `docker build -t barbecue-app .`
   - **Start Command**: `gunicorn app:app`
4. Añade las variables de entorno
5. Configura un disco persistente montado en `/app/instance`

## 📂 Estructura del Proyecto

```
barbecue/
├── app.py                      # Aplicación principal
├── models.py                   # Modelos de base de datos
├── requirements.txt            # Dependencias Python
├── Dockerfile                  # Configuración Docker
├── Procfile                    # Para Heroku/Railway
├── runtime.txt                 # Versión de Python
├── .env.example                # Ejemplo de variables de entorno
├── DEPLOY.md                   # Guía de despliegue detallada
├── GUIA_EMAIL_SMTP.md          # Configuración de correo
├── create_admin_script.py      # Script para crear admin
├── templates/                  # Plantillas HTML
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── admin.html
│   └── matrix.html
├── static/                     # Archivos estáticos
│   ├── css/
│   ├── js/
│   └── assets/
├── instance/                   # Base de datos SQLite
│   └── barbecue.db
└── uploads/                    # Comprobantes de pago
```

## 👥 Uso

### Para Usuarios
1. **Registrarse**: Ir a `/register` y subir comprobante de pago
2. **Esperar Aprobación**: Recibirás un correo de confirmación
3. **Login**: Una vez aprobado, recibirás otro correo y podrás acceder
4. **Ver Ubicación**: Accede a la página secreta `/matrix` con la ubicación del evento

### Para Administradores
1. **Login**: Accede con credenciales de admin
2. **Panel Admin**: Ve a `/admin`
3. **Gestionar Usuarios**:
   - Ver comprobantes de pago
   - Aprobar usuarios (envía correo automático)
   - Deshabilitar usuarios
   - Eliminar usuarios
   - Cambiar roles (admin/user)

## 📧 Sistema de Correos

El sistema envía correos automáticos en estos casos:

1. **Registro**: Confirmación de que el comprobante fue recibido
2. **Notificación a Admins**: Cuando un nuevo usuario se registra
3. **Aprobación**: Cuando un admin aprueba la cuenta
4. **Deshabilitación**: Cuando un admin deshabilita la cuenta

## 🔐 Seguridad

- Contraseñas hasheadas con `pbkdf2:sha256`
- Protección de rutas con `@login_required` y `@admin_required`
- Validación de archivos subidos
- Variables de entorno para datos sensibles
- `.gitignore` configurado para excluir `.env` y base de datos

## 🐛 Solución de Problemas

### Los correos no se envían
- Verifica que `MAIL_USERNAME` y `MAIL_PASSWORD` estén correctos
- Asegúrate de usar una **Contraseña de Aplicación** de Gmail (no tu contraseña normal)
- Revisa los logs: `docker logs barbecue-container`

### No aparecen usuarios en el panel admin
- Verifica que el volumen de Docker esté montado correctamente
- Asegúrate de que la base de datos esté en `instance/barbecue.db`

### Error "operation not permitted" en Docker
- Limpia archivos temporales de macOS: `find . -name "._*" -type f -delete`

## 📝 Licencia

Este proyecto es de código abierto para uso educativo.

## 👨‍💻 Autor

Desarrollado para el evento Dev Barbecue - ETITC

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:
1. Haz fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request
