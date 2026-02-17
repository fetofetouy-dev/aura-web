# Developer Setup — Aura Web

Guía para configurar el entorno de desarrollo local desde cero.

---

## 1. Clonar e instalar dependencias

```bash
git clone <repo>
cd aura-web
npm install
```

---

## 2. Crear `.env.local`

Copiar `.env.local.example` (o crear desde cero):

```env
# Google Analytics (opcional en dev)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Sitio
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generar con: openssl rand -base64 32>

# Google OAuth
GOOGLE_CLIENT_ID=<ver paso 3>
GOOGLE_CLIENT_SECRET=<ver paso 3>

# Supabase
NEXT_PUBLIC_SUPABASE_URL=<ver paso 4>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<ver paso 4>
SUPABASE_SERVICE_ROLE_KEY=<ver paso 4>
```

---

## 3. Google Cloud Console

### 3.1 Crear proyecto
- Ir a [console.cloud.google.com](https://console.cloud.google.com)
- Crear nuevo proyecto (ej: `aura-web`)

### 3.2 Habilitar APIs
En **APIs & Services → Library**, habilitar:
- ✅ **Gmail API**
- ✅ **Google Calendar API**

### 3.3 Configurar OAuth consent screen
- **APIs & Services → OAuth consent screen**
- Audience: **External**
- Completar nombre de app, email de soporte
- En **Audience → Test users**: agregar los emails de testers durante desarrollo

### 3.4 Crear credenciales OAuth
- **APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID**
- Application type: **Web application**
- Authorized redirect URIs:
  - `http://localhost:3000/api/auth/callback/google` (desarrollo)
  - `https://tudominio.com/api/auth/callback/google` (producción)
- Copiar **Client ID** y **Client Secret** al `.env.local`

---

## 4. Supabase

### 4.1 Crear proyecto
- Ir a [app.supabase.com](https://app.supabase.com)
- Crear nuevo proyecto
- En Security: habilitar **Data API** y **Automatic RLS**

### 4.2 Crear tabla `google_credentials`
En **SQL Editor**, ejecutar:

```sql
create table google_credentials (
  id uuid primary key default gen_random_uuid(),
  user_email text not null unique,
  refresh_token text not null,
  access_token text,
  expires_at bigint,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### 4.3 Obtener claves
En **Settings → API**:
- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **Publishable key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Secret key** → `SUPABASE_SERVICE_ROLE_KEY`

---

## 5. Levantar el servidor

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

---

## Notas importantes

- El setup de Google Cloud y Supabase es **una sola vez por entorno** (dev / prod)
- Los usuarios finales solo hacen login con Google — nunca tocan estas configuraciones
- En producción, agregar las variables de entorno en Vercel (Settings → Environment Variables)
