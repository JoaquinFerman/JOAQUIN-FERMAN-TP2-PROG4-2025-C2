Despliegue del servidor en Render

Este documento explica cómo desplegar el servidor (directorio `server/`) en Render usando el archivo `render.yaml` incluido en la raíz del repo.

1) Preparación
- Asegúrate de que tu repo esté en GitHub y que Render tenga acceso (conecta tu cuenta GitHub en Render).
- NO subas claves al repo. Usa las "Environment"/Secrets de Render.

2) Opciones para crear el servicio

Opción A — Importar repo usando `render.yaml` (recomendado)
- Entra a https://dashboard.render.com
- Click "New" → "Web Service"
- En la pantalla de importar repositorio, selecciona este repo y Render detectará `render.yaml`.
- Confirma los valores y crea el servicio.

Opción B — Crear manualmente (UI)
- New → Web Service → Connect repo → selecciona repo y branch (main)
- En "Root Directory" escribe: `server`
- Build Command:
  npm install --legacy-peer-deps && npm run build
- Start Command:
  node ./dist/main.js
- Plan: free (o el que quieras)
- Crear servicio

3) Environment Variables (IMPORTANT)
En la pantalla del servicio en Render: Settings → Environment → Environment Secret(s). Añade:
- MONGODB_URI = mongodb+srv://<user>:<pass>@cluster.../dbname
- JWT_SECRET = (tu secreto JWT)
- SUPABASE_URL = https://xxxxx.supabase.co
- SUPABASE_KEY = <service_role_key> (¡USAR SERVICE ROLE KEY!)

Nota de CORS: puedes restringir qué orígenes web pueden acceder a tu API configurando la variable de entorno `CLIENT_URLS` en Render.
Por ejemplo:

  CLIENT_URLS = https://tu-app-client.vercel.app,http://localhost:4200

Si `CLIENT_URLS` no está presente, la app dejará CORS permissivo (igual que antes). Se recomienda establecerlo en producción.

4) Conexión a MongoDB Atlas
- En Atlas, permite conexiones desde las IPs de Render o temporalmente habilita 0.0.0.0/0 para pruebas.
- Asegúrate que el usuario y contraseña en `MONGODB_URI` son válidos.

5) Deploy y verificación
- Tras crear, Render ejecutará el build y luego iniciará el proceso.
- Verifica logs de build y runtime.
- Prueba endpoints:
  - GET https://<tu-servicio>.onrender.com/publicaciones
  - GET https://<tu-servicio>.onrender.com/auth/login (o el que sea necesario)

6) Actualizar cliente (Vercel)
- En la app cliente (`client/`), actualiza la base URL de la API (variables en Vercel):
  - En Vercel Dashboard → tu proyecto cliente → Settings → Environment Variables
  - Añade `API_BASE_URL = https://<tu-servicio>.onrender.com`
- Re-deploy del client en Vercel si hace falta.

7) Seguridad y producción
- Cambia la IP allowlist de Atlas a un rango más seguro o implementa VPC peering (opción avanzada).
- Usa secretos en Render, no en el repo.

8) (Opcional) CLI de Render
- Instalar CLI: https://render.com/docs/cli
- Autenticar: `render login`
- Crear usando manifest: `render services create --file render.yaml` (requiere token/permiso)

Puntos a tener en cuenta
- Si usas Supabase Storage, confirma que `SUPABASE_KEY` sea la `service_role` key (necesaria para subir desde el servidor).
- Si tu app depende de file uploads locales, recuerda que Render instances son efímeras: usa Supabase o S3 para almacenamiento persistente.

Si quieres, creo también un `render-secret-setup.sh` con comandos `render` CLI de ejemplo (no lo ejecuto) para que puedas automatizar la creación con tu token de Render.
