# 🎵 Guía para Crear una Playlist Colaborativa en YouTube

Sigue estos pasos para crear una playlist en YouTube donde todos los asistentes al **Dev Barbecue** puedan agregar sus canciones favoritas.

## 1. Crear la Playlist
1. Ve a [YouTube](https://www.youtube.com).
2. En el menú lateral izquierdo, busca la sección **"Biblioteca"** o **"Playlists"**.
3. Haz clic en **"Nueva playlist"**.
4. Ponle un nombre (ej. *"Dev Barbecue 2025"*).
5. **IMPORTANTE**: Configura la privacidad como **"Pública"** o **"No listada"** (Unlisted). No la pongas en "Privada".
6. Haz clic en **"Crear"**.

## 2. Activar la Colaboración
1. Entra a la playlist que acabas de crear.
2. Haz clic en el botón de **"Editar"** (icono de lápiz) o en los tres puntos verticales y selecciona **"Colaborar"**.
3. Activa la opción **"Los colaboradores pueden agregar videos a esta playlist"**.
4. Activa también **"Permitir nuevos colaboradores"**.

## 3. Obtener los Enlaces
YouTube te dará un enlace especial de invitación.

1. **Enlace de Colaboración**: Copia el enlace que aparece en la ventana de "Colaborar". Este es el que debes poner en el botón **"Agregar canciones a la Playlist"** en tu página web.
   - *Se ve algo así:* `https://www.youtube.com/playlist?list=PLxxxxx&jct=xxxxxxxxx`

2. **ID de la Playlist**: Mira la URL de tu playlist en el navegador.
   - *Ejemplo:* `youtube.com/playlist?list=PLMC9KNkIncKtPzgY-5rmhvj7fax8fdxoj`
   - El ID es la parte después de `list=`: **`PLMC9KNkIncKtPzgY-5rmhvj7fax8fdxoj`**

## 4. Actualizar el Código
Ve al archivo `index.html` y actualiza estas dos líneas en la sección `#musica`:

```html
<!-- 1. Actualiza el ID en el iframe (src) -->
<iframe src="https://www.youtube.com/embed/videoseries?list=TU_ID_AQUI" ...>

<!-- 2. Actualiza el enlace del botón (href) -->
<a href="TU_ENLACE_DE_COLABORACION_AQUI" ...>
```

¡Listo! Ahora todos podrán poner música para el asado. 🥩🎶
