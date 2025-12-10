# Guía para Configurar el Envío de Correos (SMTP con Gmail)

Para que tu aplicación pueda enviar correos electrónicos automáticos (notificaciones de aprobación o deshabilitación), necesitas configurar un servidor SMTP. La opción más fácil y común es usar **Gmail**.

Debido a medidas de seguridad modernas, **NO** puedes usar tu contraseña normal de Gmail. Necesitas crear una **Contraseña de Aplicación**.

## Paso 1: Activar Verificación en Dos Pasos (2FA)

Si ya la tienes activa, salta al Paso 2.

1.  Ve a tu [Cuenta de Google](https://myaccount.google.com/).
2.  En el menú de la izquierda, selecciona **Seguridad**.
3.  Baja hasta la sección "Cómo inicias sesión en Google".
4.  Haz clic en **Verificación en dos pasos** y sigue las instrucciones para activarla (necesitarás tu teléfono).

## Paso 2: Crear una Contraseña de Aplicación

1.  Una vez activada la verificación en dos pasos, vuelve a la sección **Seguridad** de tu cuenta de Google.
2.  En la barra de búsqueda superior (o buscando en la sección de inicio de sesión), busca **"Contraseñas de aplicaciones"**.
    *   *Nota: A veces Google oculta esta opción. Si no la ves, usa este enlace directo: [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)*
3.  Te pedirá tu contraseña normal para confirmar identidad.
4.  En "Seleccionar aplicación", elige **Otra (nombre personalizado)**.
5.  Escribe un nombre para identificarla, por ejemplo: `DevBarbecueApp`.
6.  Haz clic en **Generar**.
7.  Aparecerá una contraseña de **16 caracteres** en un recuadro amarillo (ej: `abcd efgh ijkl mnop`).

⚠️ **COPIA ESTA CONTRASEÑA INMEDIATAMENTE**. No podrás volver a verla una vez cierres la ventana.

## Paso 3: Configurar tu Proyecto

Ahora debes usar esta contraseña en tu variable de entorno `MAIL_PASSWORD`.

### Opción A: Probando con Docker localmente

Cuando corras tu contenedor, añade las variables de entorno:

```bash
docker run -d -p 5001:5000 \
  -v $(pwd)/instance:/app/instance \
  -v $(pwd)/uploads:/app/uploads \
  -e MAIL_USERNAME=tucorreo@gmail.com \
  -e MAIL_PASSWORD="abcd efgh ijkl mnop" \
  -e MAIL_DEFAULT_SENDER=tucorreo@gmail.com \
  --name barbecue-container barbecue-app
```
*(Nota: No necesitas incluir los espacios de la contraseña, pero suele funcionar igual)*.

### Opción B: En Producción (Railway, Render, Heroku)

Ve a la sección de **Variables de Entorno (Environment Variables)** de tu panel de control y añade:

1.  `MAIL_SERVER`: `smtp.gmail.com`
2.  `MAIL_PORT`: `587`
3.  `MAIL_USE_TLS`: `True`
4.  `MAIL_USERNAME`: `tucorreo@gmail.com`
5.  `MAIL_PASSWORD`: `tu_contraseña_de_aplicacion_de_16_letras`
6.  `MAIL_DEFAULT_SENDER`: `tucorreo@gmail.com`

---
**Nota sobre otros proveedores:**
Si usas Outlook/Hotmail, el proceso es similar (busca "Contraseñas de aplicación" en seguridad de Microsoft). Si usas un correo corporativo (cPanel, Zoho), pídele a tu administrador los datos de **Servidor SMTP (Host)**, **Puerto SMTP** y **Contraseña**.
