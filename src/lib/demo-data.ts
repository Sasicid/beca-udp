// Datos de demostración: permiten correr la app completa sin Supabase
// (NEXT_PUBLIC_SUPABASE_URL sin definir). Las fechas se generan relativas a
// hoy para que la pantalla "Hoy" siempre tenga contenido.
import { anioAcademico, type FechaCorte } from "./beca";
import { hoyISO, mesActual, sumarMeses } from "./fechas";
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
  Turno,
} from "./types";

export const DEMO_CORTE: FechaCorte = { mes: 4, dia: 1 };

const cy = anioAcademico(new Date(), DEMO_CORTE); // año académico vigente

export const demoGeneraciones: Generacion[] = [
  { id: "gen-r3", anio_ingreso: cy - 2 },
  { id: "gen-r2", anio_ingreso: cy - 1 },
  { id: "gen-r1", anio_ingreso: cy },
];

export const demoHospitales: Hospital[] = [
  {
    id: "hosp-sotero",
    nombre: "Hospital Sótero del Río",
    direccion: "Av. Concha y Toro 3459, Puente Alto, Santiago",
    maps_url: "https://maps.google.com/?q=Hospital+Sotero+del+Rio",
    contactos: [
      { nombre: "Secretaría Urgencia", cargo: "Secretaría", telefono: "+56221234567" },
    ],
    indicaciones:
      "El Servicio de Urgencia está en el primer piso, entrada por calle interior. Presentarse en secretaría de Urgencia. Estacionamiento para becados en el sector B. Casino en el segundo piso del edificio central.",
  },
  {
    id: "hosp-hurtado",
    nombre: "Hospital Padre Hurtado",
    direccion: "Esperanza 2150, San Ramón, Santiago",
    maps_url: "https://maps.google.com/?q=Hospital+Padre+Hurtado",
    contactos: [
      { nombre: "Jefatura Urgencia", cargo: "Jefe de Servicio", telefono: "+56227654321" },
    ],
    indicaciones:
      "Urgencia adulto por entrada principal, ala norte. Presentarse con la enfermera coordinadora del turno.",
  },
];

export const demoServicios: Servicio[] = [
  { id: "srv-ua", nombre: "Urgencia Adulto", hospital_id: "hosp-sotero", descripcion: "Reanimación y box de urgencia adulto.", cupo: null, color: "#2563eb" },
  { id: "srv-up", nombre: "Urgencia Pediátrica", hospital_id: "hosp-sotero", descripcion: "Urgencia infantil.", cupo: null, color: "#16a34a" },
  { id: "srv-uci", nombre: "UCI", hospital_id: "hosp-hurtado", descripcion: "Unidad de paciente crítico.", cupo: 2, color: "#dc2626" },
  { id: "srv-trauma", nombre: "Traumatología", hospital_id: "hosp-hurtado", descripcion: "Urgencia traumatológica.", cupo: null, color: "#d97706" },
  { id: "srv-anestesia", nombre: "Anestesia", hospital_id: "hosp-hurtado", descripcion: "Manejo avanzado de vía aérea en pabellón.", cupo: null, color: "#7c3aed" },
];

export const demoAlumnos: Alumno[] = [
  { id: "al-1", user_id: "demo-user", nombre: "Daniela Rojas", email: "daniela.rojas@mail.udp.cl", generacion_id: "gen-r2", estado: "activo", suspendido_desde: null, fecha_egreso_override: null },
  { id: "al-2", user_id: null, nombre: "Felipe Aravena", email: "felipe.aravena@mail.udp.cl", generacion_id: "gen-r2", estado: "activo", suspendido_desde: null, fecha_egreso_override: null },
  { id: "al-3", user_id: null, nombre: "Camila Fuentes", email: "camila.fuentes@mail.udp.cl", generacion_id: "gen-r3", estado: "activo", suspendido_desde: null, fecha_egreso_override: null },
  { id: "al-4", user_id: null, nombre: "Jorge Salinas", email: "jorge.salinas@mail.udp.cl", generacion_id: "gen-r3", estado: "extendido", suspendido_desde: null, fecha_egreso_override: `${cy + 1}-10-01` },
  { id: "al-5", user_id: null, nombre: "Valentina Mora", email: "valentina.mora@mail.udp.cl", generacion_id: "gen-r1", estado: "activo", suspendido_desde: null, fecha_egreso_override: null },
  { id: "al-6", user_id: null, nombre: "Tomás Herrera", email: "tomas.herrera@mail.udp.cl", generacion_id: "gen-r1", estado: "suspendido", suspendido_desde: hoyISO(), fecha_egreso_override: null },
];

/** Id del alumno que "inició sesión" en modo demo. */
export const DEMO_ALUMNO_ID = "al-1";

const m0 = mesActual();
const rotacion = (alumno: string, servicio: string, offset: number): Asignacion => ({
  id: `as-${alumno}-${offset}`,
  alumno_id: alumno,
  servicio_id: servicio,
  mes: sumarMeses(m0, offset),
});

export const demoAsignaciones: Asignacion[] = [
  // Daniela (demo): UCI este mes, Urgencia Adulto el próximo
  rotacion("al-1", "srv-uci", -1),
  rotacion("al-1", "srv-uci", 0),
  rotacion("al-1", "srv-ua", 1),
  rotacion("al-2", "srv-trauma", 0),
  rotacion("al-2", "srv-uci", 1),
  rotacion("al-3", "srv-anestesia", 0),
  rotacion("al-3", "srv-ua", 1),
  rotacion("al-4", "srv-ua", 0),
  rotacion("al-5", "srv-up", 0),
  rotacion("al-5", "srv-trauma", 1),
];

function fechaRelativa(dias: number): string {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

export const demoTurnos: Turno[] = [
  { id: "t1", alumno_id: "al-1", fecha: fechaRelativa(2), horario: "20:00 – 08:00", lugar: "UCI Padre Hurtado", nota: "Turno de noche" },
  { id: "t2", alumno_id: "al-1", fecha: fechaRelativa(9), horario: "08:00 – 20:00", lugar: "UCI Padre Hurtado", nota: "" },
  { id: "t3", alumno_id: "al-2", fecha: fechaRelativa(3), horario: "08:00 – 20:00", lugar: "Urgencia Sótero", nota: "" },
];

export const demoEventos: Evento[] = [
  { id: "ev1", tipo: "prueba", titulo: "Prueba de ventilación mecánica", fecha: fechaRelativa(6), generacion_id: "gen-r2", alumno_ids: null, descripcion: "Tercera semana de UCI. Modos ventilatorios básicos y troubleshooting." },
  { id: "ev2", tipo: "presentacion", titulo: "Caso clínico de cierre de rotación", fecha: fechaRelativa(16), generacion_id: "gen-r2", alumno_ids: null, descripcion: "Último viernes del mes, auditorio de Urgencia." },
  { id: "ev3", tipo: "prueba", titulo: "Examen anual teórico", fecha: fechaRelativa(40), generacion_id: "gen-r3", alumno_ids: null, descripcion: "" },
];

export const demoAvisos: Aviso[] = [
  { id: "av1", titulo: "Cambio de acceso al estacionamiento del Sótero", cuerpo: "Desde el lunes el acceso de becados es por el sector B (calle interior). El sector A queda reservado a urgencias.", urgente: true, fijado: false, archivado: false, creado_en: new Date(Date.now() - 864e5).toISOString(), leido: false },
  { id: "av2", titulo: "Reunión de generación R2", cuerpo: "Reunión mensual el próximo viernes a las 13:00 en la sala de residentes.", urgente: false, fijado: true, archivado: false, creado_en: new Date(Date.now() - 3 * 864e5).toISOString(), leido: false },
  { id: "av3", titulo: "Nuevo protocolo de sepsis disponible", cuerpo: "Se subió a Material el protocolo actualizado de manejo de sepsis del servicio.", urgente: false, fijado: false, archivado: false, creado_en: new Date(Date.now() - 6 * 864e5).toISOString(), leido: true },
];

export const demoMateriales: Material[] = [
  { id: "mat1", titulo: "Protocolo de manejo de sepsis 2026", tipo: "protocolo", tema: "Sepsis", servicio_id: "srv-ua", archivo_path: "protocolos/sepsis-2026.pdf", url_externa: null, tamano: 2_400_000, archivado: false, creado_en: new Date(Date.now() - 6 * 864e5).toISOString() },
  { id: "mat2", titulo: "Ventilación mecánica: modos básicos", tipo: "presentacion", tema: "Ventilación mecánica", servicio_id: "srv-uci", archivo_path: "presentaciones/vm-basica.pdf", url_externa: null, tamano: 8_900_000, archivado: false, creado_en: new Date(Date.now() - 20 * 864e5).toISOString() },
  { id: "mat3", titulo: "Surviving Sepsis Campaign 2021 (vía biblioteca UDP)", tipo: "paper", tema: "Sepsis", servicio_id: null, archivo_path: null, url_externa: "https://doi.org/10.1007/s00134-021-06506-y", tamano: null, archivado: false, creado_en: new Date(Date.now() - 30 * 864e5).toISOString() },
  { id: "mat4", titulo: "Guía de manejo del trauma raquimedular", tipo: "guia", tema: "Trauma", servicio_id: "srv-trauma", archivo_path: "guias/trm.pdf", url_externa: null, tamano: 1_100_000, archivado: false, creado_en: new Date(Date.now() - 60 * 864e5).toISOString() },
  { id: "mat5", titulo: "Video: secuencia de intubación rápida", tipo: "enlace", tema: "Vía aérea", servicio_id: "srv-anestesia", archivo_path: null, url_externa: "https://www.youtube.com/watch?v=ejemplo", tamano: null, archivado: false, creado_en: new Date(Date.now() - 10 * 864e5).toISOString() },
];

export const demoPreguntas: Pregunta[] = [
  { id: "q1", pregunta: "¿Cómo se piden días administrativos?", respuesta: "Por correo a Coordinación con al menos 2 semanas de anticipación, copiando al tutor de la rotación en curso.", tema: "Administrativo", destacada: true, estado: "publicada" },
  { id: "q2", pregunta: "¿Quién firma el registro de procedimientos?", respuesta: "El tutor de la rotación o el jefe de turno donde se realizó el procedimiento.", tema: "Académico", destacada: false, estado: "publicada" },
];

export const demoFichas: FichaRotacion[] = [
  {
    servicio_id: "srv-uci",
    objetivos: "Soporte vital avanzado, ventilación mecánica y manejo de drogas vasoactivas.",
    antes_de_llegar: "Repasar modos ventilatorios básicos. Presentarse con la enfermera supervisora de UCI, 4° piso.",
    claves: "La visita es a las 8:30; llegar con los pacientes ya vistos. Los ingresos se presentan en ficha resumida de una plana.",
    errores_frecuentes: "Ajustar el ventilador sin avisar al staff. No registrar los cambios de drogas en la hoja de enfermería.",
    evaluaciones: "Prueba escrita de ventilación mecánica en la tercera semana.",
    contactos: [{ nombre: "Dra. Soto", cargo: "Jefa UCI", telefono: "+56922222222" }],
    actualizado_en: new Date(Date.now() - 12 * 864e5).toISOString(),
  },
  {
    servicio_id: "srv-ua",
    objetivos: "Manejo inicial del paciente grave: triage, reanimación, decisión de hospitalización.",
    antes_de_llegar: "Leer protocolo de reanimación local. Avisar al jefe de servicio por correo la semana previa. Día 1: presentarse 7:45 en secretaría de Urgencia.",
    claves: "El reanimador se pasa a las 8:00 en punto. Las interconsultas a UCI se llaman antes de las 11:00. El eco FAST está disponible en box 3.",
    errores_frecuentes: "No revisar el listado de pacientes en espera al inicio del turno. Pedir exámenes sin examinar primero.",
    evaluaciones: "Evaluación de desempeño al cierre del mes + caso clínico presentado el último viernes.",
    contactos: [{ nombre: "Dr. Pérez", cargo: "Tutor de rotación", telefono: "+56911111111" }],
    actualizado_en: new Date(Date.now() - 200 * 864e5).toISOString(),
  },
];
