// Tipos del dominio (espejo del modelo de datos, spec sección 7.2).
import type { AnioBeca, EstadoAlumno } from "./beca";

export type Rol = "coordinador" | "becado" | "egresado";

export interface Contacto {
  nombre: string;
  cargo?: string;
  telefono?: string;
  email?: string;
}

export interface Generacion {
  id: string;
  anio_ingreso: number;
}

export interface Hospital {
  id: string;
  nombre: string;
  direccion: string;
  maps_url: string | null;
  contactos: Contacto[];
  indicaciones: string;
}

export interface Servicio {
  id: string;
  nombre: string;
  hospital_id: string | null;
  descripcion: string;
  cupo: number | null;
  color: string;
}

export interface Alumno {
  id: string;
  user_id: string | null;
  nombre: string;
  email: string;
  generacion_id: string;
  estado: EstadoAlumno;
  suspendido_desde: string | null; // ISO date
  fecha_egreso_override: string | null;
}

export interface FichaRotacion {
  servicio_id: string;
  objetivos: string;
  antes_de_llegar: string;
  claves: string;
  errores_frecuentes: string;
  evaluaciones: string;
  contactos: Contacto[];
  actualizado_en: string; // ISO timestamp
}

export interface Asignacion {
  id: string;
  alumno_id: string;
  servicio_id: string;
  mes: string; // YYYY-MM
}

export interface Turno {
  id: string;
  alumno_id: string;
  fecha: string; // ISO date
  horario: string;
  lugar: string;
  nota: string;
}

export type TipoEvento = "prueba" | "presentacion" | "otro";

export interface Evento {
  id: string;
  tipo: TipoEvento;
  titulo: string;
  fecha: string; // ISO date
  generacion_id: string | null;
  alumno_ids: string[] | null;
  descripcion: string;
}

export interface Aviso {
  id: string;
  titulo: string;
  cuerpo: string;
  urgente: boolean;
  fijado: boolean;
  archivado: boolean;
  creado_en: string;
  leido?: boolean; // resuelto por usuario al consultar
}

export type TipoMaterial = "presentacion" | "paper" | "protocolo" | "guia" | "enlace";

export interface Material {
  id: string;
  titulo: string;
  tipo: TipoMaterial;
  tema: string;
  servicio_id: string | null;
  archivo_path: string | null;
  url_externa: string | null;
  tamano: number | null;
  archivado: boolean;
  creado_en: string;
}

export interface Pregunta {
  id: string;
  pregunta: string;
  respuesta: string;
  tema: string;
  destacada: boolean;
  estado: "pendiente" | "publicada";
}

/** Usuario en sesión, con su alumno resuelto si es becado. */
export interface Sesion {
  userId: string;
  nombre: string;
  rol: Rol;
  demo: boolean;
  alumno: (Alumno & { anioIngreso: number; anioBeca: AnioBeca }) | null;
}
