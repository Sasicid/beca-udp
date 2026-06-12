-- Plataforma Beca Medicina de Urgencia UDP — esquema núcleo (spec v2, sección 7.2)
-- Ejecutar en el SQL Editor de Supabase o con `supabase db push`.

-- =====================
-- Perfiles y roles
-- =====================
create table perfiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  rol text not null default 'becado' check (rol in ('coordinador', 'becado', 'egresado')),
  nombre text not null default '',
  email text not null
);

-- Escritura solo coordinador; el chequeo vive en una función para reusarlo en todas las policies.
create or replace function public.es_coordinador()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from perfiles
    where user_id = auth.uid() and rol = 'coordinador'
  );
$$;

-- =====================
-- Estructura académica
-- =====================
create table generaciones (
  id uuid primary key default gen_random_uuid(),
  anio_ingreso int not null unique check (anio_ingreso between 2000 and 2100)
);

create table hospitales (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  direccion text not null default '',
  maps_url text,
  contactos jsonb not null default '[]', -- [{nombre, cargo, telefono, email}]
  indicaciones text not null default ''
);

create table servicios (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  hospital_id uuid references hospitales (id) on delete set null,
  descripcion text not null default '',
  cupo int check (cupo > 0),
  color text not null default '#64748b' -- color fijo por servicio para el calendario
);

create table alumnos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  nombre text not null,
  email text not null unique,
  generacion_id uuid not null references generaciones (id),
  estado text not null default 'activo'
    check (estado in ('activo', 'suspendido', 'extendido', 'retirado')),
  suspendido_desde date,           -- congela el cálculo del año de beca en esa fecha
  fecha_egreso_override date,      -- extensión: corre la fecha de egreso
  ics_token uuid not null default gen_random_uuid() -- URL privada de suscripción .ics
);

-- =====================
-- Rotaciones y calendario
-- =====================
create table fichas_rotacion (
  servicio_id uuid primary key references servicios (id) on delete cascade,
  objetivos text not null default '',
  antes_de_llegar text not null default '',
  claves text not null default '',
  errores_frecuentes text not null default '',
  evaluaciones text not null default '',
  contactos jsonb not null default '[]',
  actualizado_en timestamptz not null default now()
);

create table asignaciones (
  id uuid primary key default gen_random_uuid(),
  alumno_id uuid not null references alumnos (id) on delete cascade,
  servicio_id uuid not null references servicios (id) on delete cascade,
  mes text not null check (mes ~ '^\d{4}-(0[1-9]|1[0-2])$'), -- YYYY-MM
  unique (alumno_id, mes)
);

create table turnos (
  id uuid primary key default gen_random_uuid(),
  alumno_id uuid not null references alumnos (id) on delete cascade,
  fecha date not null,
  horario text not null default '',
  lugar text not null default '',
  nota text not null default ''
);

create table eventos (
  id uuid primary key default gen_random_uuid(),
  tipo text not null check (tipo in ('prueba', 'presentacion', 'otro')),
  titulo text not null,
  fecha date not null,
  generacion_id uuid references generaciones (id) on delete cascade,
  alumno_ids uuid[],
  descripcion text not null default '',
  check (generacion_id is not null or alumno_ids is not null)
);

-- =====================
-- Comunicación y contenido
-- =====================
create table avisos (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  cuerpo text not null default '',
  urgente boolean not null default false,
  fijado boolean not null default false,
  archivado boolean not null default false,
  creado_en timestamptz not null default now()
);

create table avisos_leidos (
  aviso_id uuid not null references avisos (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  leido_en timestamptz not null default now(),
  primary key (aviso_id, user_id)
);

create table materiales (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  tipo text not null check (tipo in ('presentacion', 'paper', 'protocolo', 'guia', 'enlace')),
  tema text not null default '',
  servicio_id uuid references servicios (id) on delete set null,
  archivo_path text,   -- ruta en Supabase Storage (material propio o abierto)
  url_externa text,    -- papers de bases pagadas: enlace + DOI vía biblioteca UDP
  tamano bigint,       -- bytes; visible al navegar con datos móviles
  archivado boolean not null default false,
  creado_en timestamptz not null default now(),
  check (archivo_path is not null or url_externa is not null)
);

create table preguntas (
  id uuid primary key default gen_random_uuid(),
  pregunta text not null,
  respuesta text not null default '',
  tema text not null default '',
  destacada boolean not null default false,
  estado text not null default 'pendiente' check (estado in ('pendiente', 'publicada')),
  enviada_por uuid references auth.users (id) on delete set null,
  creado_en timestamptz not null default now()
);

create table config (
  id boolean primary key default true check (id), -- fila única
  corte_mes int not null default 4 check (corte_mes between 1 and 12),
  corte_dia int not null default 1 check (corte_dia between 1 and 31)
);
insert into config (id) values (true);

create table cambios_log (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users (id) on delete set null,
  tabla text not null,
  accion text not null,
  detalle jsonb,
  fecha timestamptz not null default now()
);

-- =====================
-- Año de beca: siempre calculado, nunca almacenado (spec sección 5)
-- =====================
-- Devuelve: 0 = aún no ingresa, 1..3 = R1..R3, 4 = egresado, -1 = retirado.
-- La suspensión congela el cálculo en suspendido_desde; la extensión mantiene R3
-- hasta fecha_egreso_override.
create or replace function public.anio_de_beca(
  p_anio_ingreso int,
  p_estado text,
  p_suspendido_desde date,
  p_fecha_egreso_override date,
  p_hoy date default current_date
) returns int
language plpgsql
stable
as $$
declare
  v_corte_mes int;
  v_corte_dia int;
  v_ref date;
  v_anio_academico int;
  v_anio int;
begin
  select corte_mes, corte_dia into v_corte_mes, v_corte_dia from config;

  if p_estado = 'retirado' then
    return -1;
  end if;

  -- Suspensión: el avance queda congelado en la fecha de suspensión.
  v_ref := case
    when p_estado = 'suspendido' and p_suspendido_desde is not null then p_suspendido_desde
    else p_hoy
  end;

  -- Año académico vigente en v_ref: cambia en la fecha de corte, no el 1 de enero.
  v_anio_academico := extract(year from v_ref)::int
    - case when v_ref < make_date(extract(year from v_ref)::int, v_corte_mes, v_corte_dia)
        then 1 else 0 end;

  v_anio := v_anio_academico - p_anio_ingreso + 1;

  if v_anio < 1 then
    return 0; -- aún no ingresa
  end if;

  -- Extensión: sigue siendo R3 hasta la fecha de egreso corrida.
  if p_estado = 'extendido' and p_fecha_egreso_override is not null then
    return case when v_ref >= p_fecha_egreso_override then 4 else least(v_anio, 3) end;
  end if;

  return least(v_anio, 4);
end;
$$;

-- Vista de consumo: alumnos con su año de beca resuelto.
create or replace view alumnos_con_anio as
select
  a.*,
  g.anio_ingreso,
  anio_de_beca(g.anio_ingreso, a.estado, a.suspendido_desde, a.fecha_egreso_override) as anio_beca
from alumnos a
join generaciones g on g.id = a.generacion_id;

-- =====================
-- Row Level Security: lectura autenticada, escritura solo coordinador
-- =====================
alter table perfiles enable row level security;
alter table generaciones enable row level security;
alter table hospitales enable row level security;
alter table servicios enable row level security;
alter table alumnos enable row level security;
alter table fichas_rotacion enable row level security;
alter table asignaciones enable row level security;
alter table turnos enable row level security;
alter table eventos enable row level security;
alter table avisos enable row level security;
alter table avisos_leidos enable row level security;
alter table materiales enable row level security;
alter table preguntas enable row level security;
alter table config enable row level security;
alter table cambios_log enable row level security;

-- Lectura para todo usuario autenticado.
create policy lectura_autenticada on generaciones for select to authenticated using (true);
create policy lectura_autenticada on hospitales for select to authenticated using (true);
create policy lectura_autenticada on servicios for select to authenticated using (true);
create policy lectura_autenticada on alumnos for select to authenticated using (true);
create policy lectura_autenticada on fichas_rotacion for select to authenticated using (true);
create policy lectura_autenticada on asignaciones for select to authenticated using (true);
create policy lectura_autenticada on turnos for select to authenticated using (true);
create policy lectura_autenticada on eventos for select to authenticated using (true);
create policy lectura_autenticada on avisos for select to authenticated using (true);
create policy lectura_autenticada on materiales for select to authenticated using (true);
create policy lectura_autenticada on config for select to authenticated using (true);

create policy perfil_propio on perfiles for select to authenticated
  using (user_id = auth.uid() or es_coordinador());

-- Q&A: publicadas para todos; las pendientes solo las ve quien las envió y Coordinación.
create policy preguntas_visibles on preguntas for select to authenticated
  using (estado = 'publicada' or enviada_por = auth.uid() or es_coordinador());

-- Escritura total solo coordinador.
create policy escribe_coordinador on generaciones for all to authenticated
  using (es_coordinador()) with check (es_coordinador());
create policy escribe_coordinador on hospitales for all to authenticated
  using (es_coordinador()) with check (es_coordinador());
create policy escribe_coordinador on servicios for all to authenticated
  using (es_coordinador()) with check (es_coordinador());
create policy escribe_coordinador on alumnos for all to authenticated
  using (es_coordinador()) with check (es_coordinador());
create policy escribe_coordinador on fichas_rotacion for all to authenticated
  using (es_coordinador()) with check (es_coordinador());
create policy escribe_coordinador on asignaciones for all to authenticated
  using (es_coordinador()) with check (es_coordinador());
create policy escribe_coordinador on turnos for all to authenticated
  using (es_coordinador()) with check (es_coordinador());
create policy escribe_coordinador on eventos for all to authenticated
  using (es_coordinador()) with check (es_coordinador());
create policy escribe_coordinador on avisos for all to authenticated
  using (es_coordinador()) with check (es_coordinador());
create policy escribe_coordinador on materiales for all to authenticated
  using (es_coordinador()) with check (es_coordinador());
create policy escribe_coordinador on config for all to authenticated
  using (es_coordinador()) with check (es_coordinador());
create policy escribe_coordinador on perfiles for update to authenticated
  using (es_coordinador()) with check (es_coordinador());

-- Excepciones: cada usuario marca sus propios avisos como leídos
create policy marcar_leido on avisos_leidos for insert to authenticated
  with check (user_id = auth.uid());
create policy ver_leidos on avisos_leidos for select to authenticated
  using (user_id = auth.uid() or es_coordinador());

-- ...y puede enviar preguntas al buzón (siempre quedan pendientes).
create policy enviar_pregunta on preguntas for insert to authenticated
  with check (enviada_por = auth.uid() and estado = 'pendiente');
create policy moderar_preguntas on preguntas for update to authenticated
  using (es_coordinador()) with check (es_coordinador());
create policy borrar_preguntas on preguntas for delete to authenticated
  using (es_coordinador());

-- Trazabilidad: visible y escribible solo por Coordinación (se inserta desde el server).
create policy log_coordinador on cambios_log for all to authenticated
  using (es_coordinador()) with check (es_coordinador());

-- =====================
-- Storage: bucket de material (privado; se sirve con URL firmada)
-- =====================
insert into storage.buckets (id, name, public, file_size_limit)
values ('materiales', 'materiales', false, 52428800) -- 50 MB por archivo
on conflict (id) do nothing;

create policy material_lectura on storage.objects for select to authenticated
  using (bucket_id = 'materiales');
create policy material_escritura on storage.objects for all to authenticated
  using (bucket_id = 'materiales' and es_coordinador())
  with check (bucket_id = 'materiales' and es_coordinador());

-- =====================
-- Alta de perfil al primer ingreso: vincula auth.users con alumnos por email
-- =====================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into perfiles (user_id, rol, nombre, email)
  values (
    new.id,
    coalesce(new.raw_app_meta_data ->> 'rol', 'becado'),
    coalesce(new.raw_user_meta_data ->> 'nombre', split_part(new.email, '@', 1)),
    new.email
  )
  on conflict (user_id) do nothing;

  update alumnos set user_id = new.id
  where email = new.email and user_id is null;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
