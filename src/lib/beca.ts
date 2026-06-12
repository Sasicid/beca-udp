// Lógica de generaciones (spec v2, sección 5).
// El año de beca NUNCA se almacena: se calcula de generación + fecha actual
// + fecha de corte + estado especial del alumno.

export type EstadoAlumno = "activo" | "suspendido" | "extendido" | "retirado";

export interface FechaCorte {
  mes: number; // 1-12
  dia: number; // 1-31
}

export interface DatosAlumno {
  anioIngreso: number;
  estado: EstadoAlumno;
  /** Congela el cálculo del avance en esta fecha (estado suspendido). */
  suspendidoDesde?: Date | null;
  /** Extensión: corre la fecha de egreso (estado extendido). */
  fechaEgresoOverride?: Date | null;
}

export type AnioBeca =
  | { tipo: "no-ingresa" }
  | { tipo: "residente"; anio: 1 | 2 | 3; suspendido: boolean }
  | { tipo: "egresado" }
  | { tipo: "retirado" };

/** Año académico vigente en una fecha: cambia en la fecha de corte, no el 1 de enero. */
export function anioAcademico(fecha: Date, corte: FechaCorte): number {
  const corteDelAnio = new Date(fecha.getFullYear(), corte.mes - 1, corte.dia);
  return fecha < corteDelAnio ? fecha.getFullYear() - 1 : fecha.getFullYear();
}

/**
 * Año de beca = años académicos completos transcurridos desde el ingreso + 1.
 * Más de 3, egresado. Los estados especiales anulan el cálculo automático
 * solo para ese alumno.
 */
export function anioDeBeca(alumno: DatosAlumno, corte: FechaCorte, hoy: Date): AnioBeca {
  if (alumno.estado === "retirado") return { tipo: "retirado" };

  const suspendido = alumno.estado === "suspendido";
  const referencia = suspendido && alumno.suspendidoDesde ? alumno.suspendidoDesde : hoy;

  const anio = anioAcademico(referencia, corte) - alumno.anioIngreso + 1;

  if (anio < 1) return { tipo: "no-ingresa" };

  if (alumno.estado === "extendido" && alumno.fechaEgresoOverride) {
    if (referencia >= alumno.fechaEgresoOverride) return { tipo: "egresado" };
    return { tipo: "residente", anio: Math.min(anio, 3) as 1 | 2 | 3, suspendido: false };
  }

  if (anio > 3) return { tipo: "egresado" };

  return { tipo: "residente", anio: anio as 1 | 2 | 3, suspendido };
}

export function etiquetaAnioBeca(a: AnioBeca): string {
  switch (a.tipo) {
    case "no-ingresa":
      return "Aún no ingresa";
    case "residente":
      return a.suspendido ? `R${a.anio} (suspendido)` : `R${a.anio}`;
    case "egresado":
      return "Egresado";
    case "retirado":
      return "Retirado";
  }
}
