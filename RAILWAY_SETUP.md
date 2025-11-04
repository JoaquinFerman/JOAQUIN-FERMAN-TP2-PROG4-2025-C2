# Railway Deployment - Configuración Completa

## Variables de Entorno Requeridas

Copia y pega estas variables en Railway Dashboard → Variables:

```
MONGODB_URI=mongodb+srv://joacoferman_db_user:JUGx2io1go6n0oWU@cluster0.6sbk1kw.mongodb.net/redsocial?retryWrites=true&w=majority
JWT_SECRET=3da588f1998d229738b1207f2501f84b
SUPABASE_URL=https://pgztknzurkcnhnmkgqmm.supabase.co
SUPABASE_KEY=sb_secret_tNKGlr4yayg3U7tJdg98MQ__EjQsz_O
NODE_ENV=production
```

## Configuración del Servicio

### Settings → Deploy
- **Root Directory**: `server`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run start:prod`

### Settings → Networking
- Railway asignará automáticamente un dominio público
- Anota la URL (ej: `tu-app.up.railway.app`)

## Verificación Post-Deployment

1. **Health Check:**
```bash
curl https://TU-APP.up.railway.app/health
```

Deberías ver:
```json
{
  "status": "healthy",
  "mongooseState": 1,
  "timestamp": "..."
}
```

2. **Test Auth Endpoint:**
```bash
curl https://TU-APP.up.railway.app/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"tu@email.com","password":"tu-password"}'
```

## Actualizar Cliente

Después del deployment exitoso, actualiza `client/src/app/config.ts`:

```typescript
export const API_BASE = 'https://TU-APP.up.railway.app';
```

## Troubleshooting

### mongooseState: 0
- Verifica que `MONGODB_URI` está configurado en Railway
- Verifica que la IP de Railway está en MongoDB Atlas Network Access (0.0.0.0/0)
- Revisa logs: Railway Dashboard → Deployments → View Logs

### 500 en POST /publicaciones
- Verifica que `JWT_SECRET` coincida entre auth.module.ts y jwt.strategy.ts
- Verifica logs de Railway para ver el error exacto

### CORS errors
- El servidor ya tiene CORS habilitado para todos los orígenes
- Si persiste, verifica que estás usando HTTPS en producción

## Comandos Útiles

**Ver logs en tiempo real:**
```bash
railway logs --project=tu-proyecto
```

**Redeploy después de cambios:**
```bash
git push origin main
# Railway detecta el push y redeploya automáticamente
```

## Diferencias vs Render

✅ Railway mantiene conexiones persistentes a MongoDB Atlas  
✅ Mejor performance para aplicaciones con DB  
✅ Deploy automático desde GitHub  
✅ $5 crédito mensual gratis  
✅ Logs en tiempo real más detallados  

❌ Render free tier cierra conexiones entre requests  
❌ Causa mongooseState: 0 intermitente  
