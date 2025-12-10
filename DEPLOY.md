# Guía de Despliegue (Deployment)

Este proyecto es una aplicación Flask diseñada para ser flexible en su despliegue. A continuación se detallan los requisitos y pasos para diferentes plataformas.

## Arquitectura

- **Backend**: Python 3.11 con Flask.
- **Base de Datos**: SQLite (por defecto) o PostgreSQL (soportado vía configuración).
- **Archivos Estáticos**: `static/` servido por Flask (se recomienda WhiteNoise o Nginx para alta escala).
- **Uploads**: Los comprobantes de pago se guardan localmente en `uploads/`.

## Variables de Entorno

Para producción, debes configurar las siguientes variables de entorno:

- `SECRET_KEY`: Una cadena larga y aleatoria para firmar sesiones.
- `DATABASE_URL`: (Opcional) URL de conexión a base de datos (ej. PostgreSQL). Si no se define, se usa SQLite local.

## Consideraciones Importantes (Persistencia)

⚠️ **IMPORTANTE**: Esta aplicación guarda datos en el sistema de archivos local:
1.  Base de datos SQLite: `instance/barbecue.db`
2.  Archivos subidos: `uploads/`

Si despliegas en plataformas con sistemas de archivos efímeros (como **Heroku** sin volúmenes, **Vercel**, o **Railway** sin configurar volúmenes), **PERDERÁS LOS DATOS** cada vez que la aplicación se reinicie.

### Solución Recomendada (Railway / Render)
1.  **Railway**:
    -   Conecta el repositorio.
    -   Railway detectará el `Dockerfile` automáticamente.
    -   Agrega un volumen persistente montado en `/app`.
    -   O mejor aún, usa una base de datos PostgreSQL gestionada por Railway y configura `DATABASE_URL`.
    -   Para los uploads, lo ideal es migrar a un servicio como AWS S3 o Cloudinary, o asegurarte de que `/app/uploads` esté en un volumen persistente.

## Despliegue con Docker (Universal)

El proyecto incluye un `Dockerfile` optimizado.

1.  Construir imagen:
    ```bash
    docker build -t barbecue-app .
    ```
2.  Correr contenedor (con persistencia):
    ```bash
    docker run -p 5000:5000 \
      -e SECRET_KEY=super_secret \
      -v $(pwd)/instance:/app/instance \
      -v $(pwd)/uploads:/app/uploads \
      barbecue-app
    ```

## Despliegue Estándar (Procfile)

Para plataformas que usan Buildpacks (como Heroku), se incluye un `Procfile`:
```
web: gunicorn app:app
```
