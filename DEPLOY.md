# Guía de Despliegue - Arquitectura Separada

## 🏗️ Arquitectura del Sistema

El proyecto ahora está dividido en dos servicios independientes:

- **Backend**: API REST con Flask (Python)
- **Frontend**: SPA con React (JavaScript)

Ambos pueden desplegarse juntos o por separado.

---

## 🚀 Despliegue Completo con Docker Compose

### Requisitos
- Docker y Docker Compose instalados
- Archivo `.env` configurado en `backend/`

### Pasos

```bash
# 1. Clonar repositorio
git clone https://github.com/ACJUGGLER645/barbecue.git
cd barbecue

# 2. Configurar variables de entorno del backend
cat > backend/.env << EOF
SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_hex(32))")
JWT_SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_hex(32))")
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME=tu_correo@gmail.com
MAIL_PASSWORD=tu_contraseña_app
MAIL_DEFAULT_SENDER=tu_correo@gmail.com
EOF

# 3. Limpiar archivos temporales de macOS (si aplica)
find . -name "._*" -type f -delete

# 4. Construir y levantar servicios
docker-compose up --build -d

# 5. Crear usuario administrador
docker-compose exec backend python create_admin.py

# 6. Ver logs
docker-compose logs -f

# 7. Acceder
# Frontend: http://localhost
# Backend API: http://localhost:5000
```

### Comandos Útiles

```bash
# Reiniciar servicios
docker-compose restart

# Ver logs de un servicio específico
docker-compose logs -f backend
docker-compose logs -f frontend

# Detener servicios
docker-compose down

# Limpiar todo (incluyendo volúmenes)
docker-compose down -v

# Reconstruir solo un servicio
docker-compose up --build backend
```

---

## 🔧 Despliegue Separado

### Backend API

#### Opción 1: Railway

```bash
# 1. Instalar Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Crear proyecto
railway init

# 4. Configurar variables de entorno en Railway Dashboard
SECRET_KEY=...
JWT_SECRET_KEY=...
MAIL_USERNAME=...
MAIL_PASSWORD=...
MAIL_DEFAULT_SENDER=...
CORS_ORIGINS=https://tu-frontend.vercel.app

# 5. Desplegar
railway up --service backend

# 6. Crear admin
railway run python create_admin.py
```

#### Opción 2: Render

1. Crear nuevo **Web Service**
2. Conectar repositorio
3. Configuración:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
4. Variables de entorno (igual que Railway)
5. Añadir **Disco Persistente**:
   - Mount Path: `/app/instance`
   - Size: 1 GB

#### Opción 3: Heroku

```bash
# 1. Login
heroku login

# 2. Crear app
heroku create barbecue-backend

# 3. Configurar buildpack
heroku buildpacks:set heroku/python

# 4. Variables de entorno
heroku config:set SECRET_KEY=...
heroku config:set JWT_SECRET_KEY=...
heroku config:set MAIL_USERNAME=...
heroku config:set MAIL_PASSWORD=...
heroku config:set CORS_ORIGINS=https://tu-frontend.vercel.app

# 5. Desplegar (desde carpeta backend)
cd backend
git init
git add .
git commit -m "Deploy backend"
heroku git:remote -a barbecue-backend
git push heroku main

# 6. Crear admin
heroku run python create_admin.py
```

---

### Frontend React

#### Opción 1: Vercel (Recomendado)

```bash
# 1. Instalar Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Desplegar (desde carpeta frontend)
cd frontend
vercel

# 4. Configurar en Vercel Dashboard:
# - Build Command: npm run build
# - Output Directory: dist
# - Root Directory: frontend

# 5. Variable de entorno
VITE_API_URL=https://tu-backend.railway.app/api
```

#### Opción 2: Netlify

```bash
# 1. Instalar Netlify CLI
npm install -g netlify-cli

# 2. Login
netlify login

# 3. Desplegar
cd frontend
netlify deploy --prod

# 4. Configurar en Netlify Dashboard:
# - Build command: npm run build
# - Publish directory: dist
# - Environment variables:
VITE_API_URL=https://tu-backend.railway.app/api
```

#### Opción 3: GitHub Pages (Solo frontend estático)

```bash
# 1. Instalar gh-pages
cd frontend
npm install --save-dev gh-pages

# 2. Añadir scripts en package.json
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}

# 3. Configurar base en vite.config.js
export default defineConfig({
  base: '/barbecue/',
  // ...
})

# 4. Desplegar
npm run deploy
```

---

## 🐳 Despliegue en VPS/EC2

### Con Docker Compose

```bash
# 1. Conectar al servidor
ssh usuario@tu-servidor.com

# 2. Instalar Docker y Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 3. Clonar repositorio
git clone https://github.com/ACJUGGLER645/barbecue.git
cd barbecue

# 4. Configurar .env
nano backend/.env

# 5. Levantar servicios
docker-compose up -d

# 6. Configurar nginx como proxy reverso (opcional)
sudo apt install nginx
sudo nano /etc/nginx/sites-available/barbecue
```

Configuración de nginx:

```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    # Frontend
    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

```bash
# Activar configuración
sudo ln -s /etc/nginx/sites-available/barbecue /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Configurar SSL con Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d tu-dominio.com
```

---

## 📊 Configuración de Base de Datos PostgreSQL

### Para Producción (Recomendado)

#### Railway

1. En Railway Dashboard, añade **PostgreSQL** database
2. Copia la `DATABASE_URL`
3. Añádela como variable de entorno en el backend
4. Railway automáticamente reemplazará SQLite

#### Render

1. Crea **PostgreSQL** database
2. Copia la **Internal Database URL**
3. Añádela como variable `DATABASE_URL` en el backend

#### Migrar datos de SQLite a PostgreSQL

```bash
# 1. Exportar desde SQLite
sqlite3 backend/instance/barbecue.db .dump > backup.sql

# 2. Limpiar sintaxis incompatible
sed -i 's/PRAGMA.*//g' backup.sql
sed -i 's/BEGIN TRANSACTION;//g' backup.sql
sed -i 's/COMMIT;//g' backup.sql

# 3. Importar a PostgreSQL
psql $DATABASE_URL < backup.sql
```

---

## � Seguridad en Producción

### Variables de Entorno Seguras

```bash
# Generar claves secretas
python3 -c "import secrets; print(secrets.token_hex(32))"
```

### CORS

Actualiza `CORS_ORIGINS` en el backend con el dominio del frontend:

```env
CORS_ORIGINS=https://tu-frontend.vercel.app,https://www.tu-dominio.com
```

### HTTPS

- **Vercel/Netlify**: HTTPS automático
- **Railway/Render**: HTTPS automático
- **VPS**: Usa Let's Encrypt (ver arriba)

---

## 📈 Monitoreo y Logs

### Docker Compose

```bash
# Ver logs en tiempo real
docker-compose logs -f

# Ver logs de un servicio
docker-compose logs -f backend

# Ver últimas 100 líneas
docker-compose logs --tail=100 backend
```

### Railway

```bash
railway logs
```

### Render

Ver logs en el Dashboard o con CLI:

```bash
render logs
```

### Heroku

```bash
heroku logs --tail
```

---

## 🔄 Actualizar la Aplicación

### Docker Compose

```bash
git pull
docker-compose down
docker-compose up --build -d
```

### Railway/Render/Vercel

Simplemente haz push a GitHub:

```bash
git add .
git commit -m "Update"
git push origin main
```

El despliegue es automático.

---

## 🐛 Solución de Problemas

### Backend no conecta con Frontend

**Problema**: CORS errors en consola del navegador

**Solución**:
```bash
# Verifica que CORS_ORIGINS incluya el dominio del frontend
# En backend/.env o variables de entorno:
CORS_ORIGINS=http://localhost:5173,https://tu-frontend.vercel.app
```

### Frontend no encuentra el backend

**Problema**: 404 en llamadas API

**Solución**:
```bash
# Verifica VITE_API_URL en frontend
# En frontend/.env:
VITE_API_URL=https://tu-backend.railway.app/api
```

### Archivos no persisten en Docker

**Problema**: Base de datos o uploads se pierden al reiniciar

**Solución**:
```yaml
# Verifica volúmenes en docker-compose.yml
volumes:
  - ./backend/instance:/app/instance
  - ./backend/uploads:/app/uploads
```

### Error "operation not permitted" en macOS

**Solución**:
```bash
find . -name "._*" -type f -delete
```

---

## 📞 Soporte

Para problemas específicos:
- Backend: Revisa logs con `docker-compose logs backend`
- Frontend: Revisa consola del navegador (F12)
- Email: Verifica [GUIA_EMAIL_SMTP.md](GUIA_EMAIL_SMTP.md)

---

## 📚 Recursos Adicionales

- [README_SEPARATED.md](README_SEPARATED.md) - Documentación completa
- [MIGRATION_STATUS.md](MIGRATION_STATUS.md) - Estado de migración
- [GUIA_EMAIL_SMTP.md](GUIA_EMAIL_SMTP.md) - Configuración de correo
