# Configuración de Deployment en Vercel

## Instrucciones para configurar el proyecto en Vercel

### 1. Build & Development Settings

Ve a tu proyecto en Vercel → **Settings** → **Build & Development Settings** y configura:

#### Framework Preset
- Selecciona: **Other** (o deja el preset detectado automáticamente)

#### Root Directory
- **IMPORTANTE**: Deja este campo **VACÍO** o ponlo en `.` (punto)
- NO uses `server/` como Root Directory
- Razón: Las funciones serverless están en `api/` en la raíz del repositorio

#### Build Command
- Usa: `npm run vercel-build`
- Este comando:
  1. Entra en el directorio `server/`
  2. Instala dependencias con `npm ci`
  3. Compila el proyecto Nest con `npm run build`
  4. Genera `server/dist/src/serverless.js`

#### Output Directory
- Deja este campo **VACÍO** o en blanco
- NO configures un Output Directory
- Razón: Este es un proyecto serverless, no un sitio estático

#### Install Command
- Puedes dejar el valor por defecto (`npm install` o `npm ci`)
- Vercel lo ejecutará en la raíz para instalar las dependencias básicas

### 2. Environment Variables

Ve a **Settings** → **Environment Variables** y configura:

| Variable | Descripción | Valor de ejemplo |
|----------|-------------|------------------|
| `MONGODB_URI` | URI de conexión a MongoDB Atlas | `mongodb+srv://user:pass@cluster.mongodb.net/dbname` |
| `JWT_SECRET` | Secreto para firmar tokens JWT | `tu-secreto-super-seguro-aqui` |
| `SUPABASE_URL` | URL de tu proyecto Supabase | `https://xxxxx.supabase.co` |
| `SUPABASE_KEY` | Service role key de Supabase (NO anon key) | `eyJhbGc...` |

**Importante**: 
- Asigna las variables a los entornos necesarios (Production, Preview)
- `SUPABASE_KEY` **debe ser** el **service_role key**, NO la anon/public key
- El service_role key se encuentra en Supabase → Settings → API → service_role (secret)

### 3. Verificar el Deploy

Después de configurar:

1. Haz un push al repositorio o usa "Redeploy" en Vercel
2. Verifica los logs del build:
   - Debe ejecutar `npm run vercel-build`
   - Debe ver: `cd server && npm ci && npm run build`
   - Debe compilar con `nest build`
   - No debe haber errores de "Output Directory" ni "Missing script"
3. En el Deployment Summary debes ver:
   - **Functions**: debe aparecer al menos 1 función (en `api/`)
   - La función debe estar en la ruta `/` o `/api/index.js`

### 4. Testing

Una vez desplegado:

```bash
# Test básico de la API
curl https://tu-proyecto.vercel.app/

# Debería responder con los endpoints de Nest
```

### 5. Troubleshooting

#### No aparecen funciones en Deployment Summary
- ✅ Verifica que Root Directory esté vacío (no `server/`)
- ✅ Verifica que exista el directorio `api/` en la raíz del repo
- ✅ Asegúrate de que `api/index.js` y `api/server.js` existan

#### Error "Cannot find module server/dist/src/serverless"
- ✅ Verifica que Build Command sea `npm run vercel-build`
- ✅ Revisa logs del build para confirmar que `nest build` se ejecutó
- ✅ Verifica que `server/dist/src/serverless.js` se haya generado

#### Errores 500 en runtime
- ✅ Verifica que todas las variables de entorno estén configuradas
- ✅ Revisa los logs de la función en Vercel (Deployments → Function Logs)
- ✅ Verifica que MONGODB_URI sea válido y accesible desde Vercel
- ✅ Asegúrate de permitir conexiones desde cualquier IP en MongoDB Atlas (0.0.0.0/0) o agrega las IPs de Vercel

#### Build falla con "Missing script: vercel-build"
- ✅ Verifica que Root Directory esté vacío (no `server/`)
- ✅ Asegúrate de que `package.json` en la raíz tenga el script `vercel-build`

## Estructura esperada

```
/
├── api/                    # Funciones serverless de Vercel
│   ├── index.js           # Handler principal que carga el Nest app
│   └── server.js          # Backup handler
├── server/                 # Aplicación NestJS
│   ├── src/
│   │   ├── serverless.ts  # Bootstrap serverless
│   │   └── ...
│   ├── dist/              # Generado por build
│   │   └── src/
│   │       └── serverless.js
│   └── package.json
├── package.json           # Raíz (con vercel-build)
└── vercel.json            # Configuración de Vercel
```

## Comandos útiles

```bash
# Build local para testing
npm run vercel-build

# Verificar que se generó el artefacto
ls -la server/dist/src/serverless.js

# Testing local del handler (requiere instalar vercel CLI)
vercel dev
```

## Recursos

- [Vercel Node.js Functions](https://vercel.com/docs/functions/serverless-functions/runtimes/node-js)
- [Vercel Build Configuration](https://vercel.com/docs/projects/project-configuration)
- [NestJS Standalone Application](https://docs.nestjs.com/standalone-applications)
