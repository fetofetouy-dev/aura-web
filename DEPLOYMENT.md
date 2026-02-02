# Guía de Deployment en Vercel

## Pre-requisitos

1. Cuenta en [Vercel](https://vercel.com)
2. Repositorio Git (GitHub, GitLab o Bitbucket)
3. Código subido al repositorio

## Pasos para Deploy

### 1. Preparar el Repositorio

```bash
# Inicializar git si no lo has hecho
git init

# Agregar todos los archivos
git add .

# Commit inicial
git commit -m "Initial commit: Aura website"

# Agregar remote (reemplaza con tu repo)
git remote add origin https://github.com/tu-usuario/aura-web.git

# Push
git push -u origin main
```

### 2. Conectar con Vercel

**Opción A: Desde la Web UI**

1. Ve a [vercel.com](https://vercel.com) e inicia sesión
2. Click en "Add New..." → "Project"
3. Importa tu repositorio de GitHub/GitLab/Bitbucket
4. Vercel detectará automáticamente que es un proyecto Next.js

**Opción B: Desde CLI**

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel
```

### 3. Configurar Variables de Entorno

En el dashboard de Vercel:

1. Ve a tu proyecto → Settings → Environment Variables
2. Agrega las siguientes variables:

```
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_SITE_URL=https://tu-dominio.com
```

### 4. Configurar Dominio Personalizado

1. En Settings → Domains
2. Agrega tu dominio personalizado (ej: `aura.com`)
3. Sigue las instrucciones para actualizar DNS

**Configuración DNS típica:**
```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### 5. Deploy Automático

Una vez conectado, cada push a la rama `main` desplegará automáticamente.

Para crear preview deployments de otras ramas:
```bash
git checkout -b feature/nueva-funcionalidad
git push origin feature/nueva-funcionalidad
```

Vercel creará una URL preview automáticamente.

## Configuración de Analytics

### Google Analytics

1. Crea una propiedad en [Google Analytics](https://analytics.google.com)
2. Copia el ID de medición (formato: `G-XXXXXXXXXX`)
3. Agrégalo como variable de entorno en Vercel: `NEXT_PUBLIC_GA_ID`
4. Redeploy el sitio

### Vercel Analytics (Opcional)

Incluido gratis en Vercel:

1. Ve a tu proyecto → Analytics
2. Click en "Enable"
3. Ya está! No requiere código adicional

## Performance y Optimización

### Optimizaciones Aplicadas

✅ Next.js Image Optimization (automático)
✅ Edge Functions (automático con Vercel)
✅ Server Components para mejor rendimiento
✅ Lazy loading del demo interactivo
✅ Tree-shaking de dependencias

### Verificar Performance

1. Deploy a producción
2. Ejecuta Lighthouse:
   - Abre Chrome DevTools (F12)
   - Tab "Lighthouse"
   - Selecciona "Performance" y "SEO"
   - Click "Analyze"

**Meta:** Score > 90 en todas las categorías

## Troubleshooting

### Error: "Module not found"
```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

### Error: Build fallado en Vercel
- Revisa los logs en Vercel dashboard
- Verifica que todas las dependencias estén en `package.json`
- Asegúrate de que `npm run build` funcione localmente

### Logo no se muestra
- Verifica que `/public/logo-aura.svg` exista
- Check paths en componentes (deben ser `/logo-aura.svg` no `./logo-aura.svg`)

### Google Analytics no trackea
- Verifica que `NEXT_PUBLIC_GA_ID` esté configurado
- Usa extensión de Chrome "Google Analytics Debugger"
- Check console del navegador por errores

## Comandos Útiles

```bash
# Build local
npm run build

# Preview del build
npm start

# Deploy preview
vercel

# Deploy a producción
vercel --prod

# Ver logs en tiempo real
vercel logs

# Ver deployments
vercel ls
```

## Monitoreo Post-Deploy

### Checklist de Verificación

- [ ] Sitio carga correctamente en `https://tu-dominio.com`
- [ ] Todas las secciones se muestran
- [ ] Demo interactivo funciona
- [ ] Logo Aura se muestra correctamente
- [ ] Links de navegación funcionan
- [ ] Descarga de caso de estudio funciona
- [ ] Google Analytics trackea (check en 24hrs)
- [ ] Mobile responsive (test en dispositivos reales)
- [ ] Performance Lighthouse > 90
- [ ] No hay errores en console

### Siguientes Pasos

1. **SEO**: Enviar sitemap a Google Search Console
2. **Marketing**: Configurar Google Ads / LinkedIn Ads
3. **Email**: Configurar formulario de contacto con Resend
4. **CRM**: Integrar leads con tu CRM
5. **Iteración**: A/B testing de CTAs

## Soporte

Si tienes problemas:
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Support](https://vercel.com/support)

---

¡Listo! Tu sitio de Aura está en producción 🚀
