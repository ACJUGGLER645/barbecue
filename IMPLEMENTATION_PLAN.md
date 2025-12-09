# Plan de Implementación: Sistema de Login y Gestión de Usuarios

Este documento describe los pasos para transformar el sitio estático actual en una aplicación web dinámica con autenticación, base de datos y gestión de pagos.

## 1. Arquitectura del Sistema

*   **Frontend**: HTML/CSS/JS existente (se modificará para interactuar con el backend).
*   **Backend**: Python con **Flask**. Es ligero, fácil de desplegar y perfecto para este tipo de aplicaciones.
*   **Base de Datos**: **SQLite** (para desarrollo local) -> **PostgreSQL** (recomendado para producción) o SQLite con volumen persistente.
*   **Almacenamiento de Imágenes**: Carpeta local `uploads/` (requiere volumen persistente en despliegue).

## 2. Base de Datos (Modelo de Datos)

### Tabla `users`
*   `id`: Integer (PK)
*   `email`: String (Unique)
*   `password_hash`: String
*   `name`: String
*   `role`: String ('user', 'admin') - Por defecto 'user'.
*   `is_enabled`: Boolean - Por defecto `False` (hasta que se verifique el pago).
*   `payment_proof`: String (Ruta del archivo de imagen subido).
*   `created_at`: DateTime

## 3. Endpoints de la API (Backend)

*   `POST /api/register`: Recibe datos del usuario y la imagen del comprobante. Crea el usuario con `is_enabled=False`.
*   `POST /api/login`: Verifica credenciales. Retorna un token de sesión o JWT.
*   `GET /api/status`: Verifica el estado del usuario actual (si está logueado y si está habilitado).
*   `GET /api/content`: Retorna el contenido protegido (lista de eventos, fotos exclusivas) solo si el usuario está `enabled`.
*   `POST /api/admin/approve/<user_id>`: (Solo Admin) Habilita a un usuario.

## 4. Cambios en el Frontend

1.  **Página de Login/Registro (`login.html`)**:
    *   Formulario de Login.
    *   Formulario de Registro con campo para subir imagen (`<input type="file">`).
2.  **Modificación de `index.html`**:
    *   Ocultar secciones "Premium" (lista completa, fotos exclusivas) por defecto.
    *   Mostrar botón "Iniciar Sesión" o "Mi Cuenta".
    *   Si el usuario se loguea pero no está habilitado: Mostrar mensaje "Tu pago está siendo verificado".
    *   Si el usuario está habilitado: Cargar y mostrar el contenido oculto dinámicamente.
3.  **Panel de Administración (Opcional por ahora)**:
    *   Una página simple para ver los comprobantes de pago y aprobar usuarios.

## 5. Estrategia de Despliegue

*   Crear `requirements.txt` (Flask, SQLAlchemy, etc.).
*   Crear `Dockerfile` o configuración para Railway/Render.
*   Configurar volúmenes para la persistencia de la base de datos y las imágenes subidas.

---

### ¿Cómo proceder?

1.  **Confirmar Stack**: ¿Estás de acuerdo con usar **Python/Flask** para el backend?
2.  **Estructura de Carpetas**: Moveremos los archivos frontend actuales a una carpeta `templates` (HTML) y `static` (CSS/JS/Assets) para seguir la estructura estándar de Flask, o mantendremos el frontend separado consumiendo la API (más complejo pero más moderno). *Recomendación: Estructura estándar de Flask para empezar rápido.*
