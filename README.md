# Plataforma Beca Medicina de Urgencia UDP

Portal único para los becados de Medicina de Urgencia UDP: al abrir el teléfono en el
hospital, en menos de cinco segundos se sabe dónde se rota este mes, qué turno viene y
qué se viene encima. Construido según la **especificación v2** (junio 2026).

**Stack**: Next.js 16 (App Router) + Tailwind 4 + Supabase (Postgres, Auth, Storage, RLS).
Mobile first, PWA instalable con offline básico.

## Correr en local (modo demo)

Sin configurar nada, la app corre con datos de ejemplo y sin login:

```bash
npm install
npm run dev
```

Abrir <http://localhost:3000>. El banner "Modo demostración" indica que Supabase no está
conectado.

```bash
npm test    # tests de la lógica de año de beca (fecha de corte, estados especiales)
```

## Conectar Supabase (datos reales)

1. Crear un proyecto gratuito en [supabase.com](https://supabase.com).
2. En el **SQL Editor**, ejecutar [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql)
   (esquema completo: tablas, RLS, función `anio_de_beca`, bucket de Storage y trigger de
   alta de perfil). Opcional: [`supabase/seed.sql`](supabase/seed.sql) para datos de prueba.
3. Copiar `.env.example` a `.env.local` y completar `NEXT_PUBLIC_SUPABASE_URL` y
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Dashboard → Settings → API).
4. Crear el usuario de Coordinación: invitarlo desde Authentication → Users (usar el
   **correo institucional**, el cargo rota) y luego en SQL:
   `update perfiles set rol = 'coordinador' where email = 'coordinacion@udp.cl';`
5. Reiniciar `npm run dev`: ahora exige login y aplica RLS (escritura solo Coordinación).

Los alumnos se crean en la tabla `alumnos` con su correo; al aceptar la invitación de
Supabase Auth, el trigger los vincula automáticamente por email.

## Desplegar (costo cero inicial)

- **Vercel**: importar el repo, definir las dos variables de entorno y desplegar.
- **Supabase**: el plan gratuito alcanza para decenas de usuarios (spec sección 7).

## Estructura

| Ruta | Qué es |
|---|---|
| `src/app/page.tsx` | Pantalla **Hoy** personalizada (spec 3.1) |
| `src/app/calendario/` | Vista personal + matriz "ver todo" (3.3) |
| `src/app/rotacion/[servicioId]/` | Ficha de rotación de estructura fija (3.4) |
| `src/app/material/` | Repositorio con búsqueda y filtros (3.5) |
| `src/app/mas/` | Avisos, Q&A con buzón, hospitales (3.6–3.8) |
| `src/lib/beca.ts` | Año de beca calculado, nunca almacenado (sección 5) |
| `src/lib/data.ts` | Capa de datos: Supabase o demo |
| `supabase/migrations/` | Esquema, RLS y función de año de beca (7.2) |
| `proxy.ts` | Protección de rutas y refresco de sesión |

## Estado vs. especificación

**Fase 1 (MVP) — implementado**

- ✅ Login con roles (coordinador / becado / egresado) y RLS
- ✅ Generaciones con avance automático, fecha de corte configurable y estados
  especiales (suspensión congela, extensión corre el egreso, retiro)
- ✅ Pantalla "Hoy" personalizada con banner urgente
- ✅ Calendario personal + matriz general (acordeón en móvil)
- ✅ Avisos (normal / urgente / fijado) con marcado de lectura y archivo
- ✅ Fichas de rotación con estructura fija de 7 secciones y fecha de actualización
- ✅ Material con búsqueda, filtros, peso visible y enlaces vía biblioteca UDP
- ✅ Q&A con banco por tema y buzón moderado (cola privada de Coordinación)
- ✅ Hospitales con mapas, llamada directa e indicaciones
- ✅ Responsive completo + PWA instalable con offline básico

**Pendiente (siguientes iteraciones)**

- Modo edición sobre la página para el Coordinador + panel estructural (4.1–4.6)
- Matriz de rotaciones editable con "copiar mes anterior"
- Exportación .ics por alumno con token privado (el campo `ics_token` ya existe)
- Correo automático en avisos urgentes (Resend), búsqueda global, trazabilidad visible
- Manual de marca UDP: la paleta actual es provisoria

## Decisiones abiertas (cerrar con Coordinación — spec sección 9)

Fecha de corte real del año académico (hoy: 1 de abril en `config`), acceso de
egresados, notas sí/no, listado definitivo de servicios y hospitales, responsable de
datos y traspaso, cupos por servicio.
