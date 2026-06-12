// Capa de datos del lado servidor. Con Supabase configurado consulta la BD
// (RLS aplica según el usuario); sin configurar, sirve los datos demo para
// poder correr y revisar la app completa en local.
import "server-only";

import { anioDeBeca, type FechaCorte } from "./beca";
import {
  DEMO_ALUMNO_ID,
  DEMO_CORTE,
  demoAlumnos,
  demoAsignaciones,
  demoAvisos,
  demoEventos,
  demoFichas,
  demoGeneraciones,
  demoHospitales,
  demoMateriales,
  demoPreguntas,
  demoServicios,
  demoTurnos,
} from "./demo-data";
import { hoyISO, mesActual, parseFechaLocal, sumarMeses } from "./fechas";
import { supabaseConfigurado, supabaseServer } from "./supabase/server";
import type {
  Alumno,
  Asignacion,
  Aviso,
  Evento,
  FichaRotacion,
  Generacion,
  Hospital,
  Material,
  Pregunta,
  Servicio,
  Sesion,
  Turno,
} from "./types";

const demo = () => !supabaseConfigurado();

export async function getFechaCorte(): Promise<FechaCorte> {
  if (demo()) return DEMO_CORTE;
  const sb = await supabaseServer();
  const { data } = await sb.from("config").select("corte_mes, corte_dia").single();
  return data ? { mes: data.corte_mes, dia: data.corte_dia } : { mes: 1, dia: 1 };
}

export async function getSesion(): Promise<Sesion | null> {
  if (demo()) {
    const alumno = demoAlumnos.find((a) => a.id === DEMO_ALUMNO_ID)!;
    const gen = demoGeneraciones.find((g) => g.id === alumno.generacion_id)!;
    return {
      userId: "demo-user",
      nombre: alumno.nombre,
      rol: "becado",
      demo: true,
      alumno: {
        ...alumno,
        anioIngreso: gen.anio_ingreso,
        anioBeca: anioDeBeca(
          { anioIngreso: gen.anio_ingreso, estado: alumno.estado },
          DEMO_CORTE,
          new Date(),
        ),
      },
    };
  }

  const sb = await supabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return null;

  const { data: perfil } = await sb
    .from("perfiles")
    .select("rol, nombre")
    .eq("user_id", user.id)
    .single();

  const { data: alumno } = await sb
    .from("alumnos")
    .select("*, generaciones(anio_ingreso)")
    .eq("user_id", user.id)
    .maybeSingle();

  const corte = await getFechaCorte();
  return {
    userId: user.id,
    nombre: perfil?.nombre ?? user.email ?? "",
    rol: perfil?.rol ?? "becado",
    demo: false,
    alumno: alumno
      ? {
          ...alumno,
          anioIngreso: alumno.generaciones.anio_ingreso,
          anioBeca: anioDeBeca(
            {
              anioIngreso: alumno.generaciones.anio_ingreso,
              estado: alumno.estado,
              suspendidoDesde: alumno.suspendido_desde
                ? parseFechaLocal(alumno.suspendido_desde)
                : null,
              fechaEgresoOverride: alumno.fecha_egreso_override
                ? parseFechaLocal(alumno.fecha_egreso_override)
                : null,
            },
            corte,
            new Date(),
          ),
        }
      : null,
  };
}

export async function getServicios(): Promise<Servicio[]> {
  if (demo()) return demoServicios;
  const sb = await supabaseServer();
  const { data } = await sb.from("servicios").select("*").order("nombre");
  return data ?? [];
}

export async function getHospitales(): Promise<Hospital[]> {
  if (demo()) return demoHospitales;
  const sb = await supabaseServer();
  const { data } = await sb.from("hospitales").select("*").order("nombre");
  return data ?? [];
}

export async function getGeneraciones(): Promise<Generacion[]> {
  if (demo()) return demoGeneraciones;
  const sb = await supabaseServer();
  const { data } = await sb.from("generaciones").select("*").order("anio_ingreso");
  return data ?? [];
}

export async function getAlumnos(): Promise<Alumno[]> {
  if (demo()) return demoAlumnos;
  const sb = await supabaseServer();
  const { data } = await sb.from("alumnos").select("*").order("nombre");
  return data ?? [];
}

export async function getAsignaciones(meses: string[]): Promise<Asignacion[]> {
  if (demo()) return demoAsignaciones.filter((a) => meses.includes(a.mes));
  const sb = await supabaseServer();
  const { data } = await sb.from("asignaciones").select("*").in("mes", meses);
  return data ?? [];
}

export async function getTurnos(alumnoId: string): Promise<Turno[]> {
  if (demo()) {
    return demoTurnos
      .filter((t) => t.alumno_id === alumnoId && t.fecha >= hoyISO())
      .sort((a, b) => a.fecha.localeCompare(b.fecha));
  }
  const sb = await supabaseServer();
  const { data } = await sb
    .from("turnos")
    .select("*")
    .eq("alumno_id", alumnoId)
    .gte("fecha", hoyISO())
    .order("fecha");
  return data ?? [];
}

/** Eventos que afectan al alumno: los de su generación o dirigidos a él. */
export async function getEventos(alumnoId: string, generacionId: string): Promise<Evento[]> {
  if (demo()) {
    return demoEventos
      .filter(
        (e) =>
          (e.generacion_id === generacionId || e.alumno_ids?.includes(alumnoId)) &&
          e.fecha >= hoyISO(),
      )
      .sort((a, b) => a.fecha.localeCompare(b.fecha));
  }
  const sb = await supabaseServer();
  const { data } = await sb
    .from("eventos")
    .select("*")
    .or(`generacion_id.eq.${generacionId},alumno_ids.cs.{${alumnoId}}`)
    .gte("fecha", hoyISO())
    .order("fecha");
  return data ?? [];
}

export async function getAvisos(userId: string): Promise<Aviso[]> {
  if (demo()) return demoAvisos;
  const sb = await supabaseServer();
  const [{ data: avisos }, { data: leidos }] = await Promise.all([
    sb.from("avisos").select("*").eq("archivado", false).order("creado_en", { ascending: false }),
    sb.from("avisos_leidos").select("aviso_id").eq("user_id", userId),
  ]);
  const setLeidos = new Set((leidos ?? []).map((l) => l.aviso_id));
  return (avisos ?? []).map((a) => ({ ...a, leido: setLeidos.has(a.id) }));
}

export async function getFicha(servicioId: string): Promise<FichaRotacion | null> {
  if (demo()) return demoFichas.find((f) => f.servicio_id === servicioId) ?? null;
  const sb = await supabaseServer();
  const { data } = await sb
    .from("fichas_rotacion")
    .select("*")
    .eq("servicio_id", servicioId)
    .maybeSingle();
  return data;
}

export async function getMateriales(): Promise<Material[]> {
  if (demo()) return demoMateriales;
  const sb = await supabaseServer();
  const { data } = await sb
    .from("materiales")
    .select("*")
    .eq("archivado", false)
    .order("creado_en", { ascending: false });
  return data ?? [];
}

export async function getPreguntas(): Promise<Pregunta[]> {
  if (demo()) return demoPreguntas;
  const sb = await supabaseServer();
  const { data } = await sb
    .from("preguntas")
    .select("*")
    .eq("estado", "publicada")
    .order("destacada", { ascending: false });
  return data ?? [];
}

// ---------- Vistas compuestas ----------

export interface DatosHoy {
  avisoUrgente: Aviso | null;
  rotacion: { asignacion: Asignacion; servicio: Servicio; hospital: Hospital | null } | null;
  proximoTurno: Turno | null;
  hitos: Evento[];
  avisosNoLeidos: Aviso[];
}

/** Pantalla "Hoy" (spec 3.1): todo lo del alumno en una sola consulta compuesta. */
export async function getDatosHoy(sesion: Sesion): Promise<DatosHoy> {
  const alumno = sesion.alumno;
  const mes = mesActual();

  const [servicios, hospitales, avisos] = await Promise.all([
    getServicios(),
    getHospitales(),
    getAvisos(sesion.userId),
  ]);

  let rotacion: DatosHoy["rotacion"] = null;
  let proximoTurno: Turno | null = null;
  let hitos: Evento[] = [];

  if (alumno) {
    const [asignaciones, turnos, eventos] = await Promise.all([
      getAsignaciones([mes]),
      getTurnos(alumno.id),
      getEventos(alumno.id, alumno.generacion_id),
    ]);
    const asignacion = asignaciones.find((a) => a.alumno_id === alumno.id) ?? null;
    if (asignacion) {
      const servicio = servicios.find((s) => s.id === asignacion.servicio_id)!;
      rotacion = {
        asignacion,
        servicio,
        hospital: hospitales.find((h) => h.id === servicio.hospital_id) ?? null,
      };
    }
    proximoTurno = turnos[0] ?? null;
    hitos = eventos.slice(0, 4);
  }

  const noLeidos = avisos.filter((a) => !a.leido && !a.archivado);
  return {
    avisoUrgente: noLeidos.find((a) => a.urgente) ?? null,
    rotacion,
    proximoTurno,
    hitos,
    avisosNoLeidos: noLeidos.filter((a) => !a.urgente).slice(0, 3),
  };
}

/** Meses de la ventana del calendario: anterior, actual y los 4 siguientes. */
export function mesesVentana(): string[] {
  const m0 = mesActual();
  return [-1, 0, 1, 2, 3, 4].map((n) => sumarMeses(m0, n));
}
