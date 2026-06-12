// Utilidades de fecha. Todo el sitio se muestra en español de Chile.

/** Mes en formato YYYY-MM. */
export function mesDe(fecha: Date): string {
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}`;
}

export function mesActual(): string {
  return mesDe(new Date());
}

/** Suma meses a un YYYY-MM. */
export function sumarMeses(mes: string, n: number): string {
  const [a, m] = mes.split("-").map(Number);
  const d = new Date(a, m - 1 + n, 1);
  return mesDe(d);
}

/** es-CL entrega todo en minúscula; solo se alza la primera letra. */
function capitalizar(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function nombreMes(mes: string): string {
  const [a, m] = mes.split("-").map(Number);
  return capitalizar(
    new Date(a, m - 1, 1).toLocaleDateString("es-CL", { month: "long", year: "numeric" }),
  );
}

export function fechaCorta(iso: string): string {
  return capitalizar(
    parseFechaLocal(iso).toLocaleDateString("es-CL", {
      weekday: "short",
      day: "numeric",
      month: "short",
    }),
  );
}

export function fechaLarga(iso: string): string {
  return capitalizar(
    parseFechaLocal(iso).toLocaleDateString("es-CL", {
      weekday: "long",
      day: "numeric",
      month: "long",
    }),
  );
}

/** Interpreta YYYY-MM-DD como fecha local (Date.parse lo tomaría como UTC). */
export function parseFechaLocal(iso: string): Date {
  const [a, m, d] = iso.slice(0, 10).split("-").map(Number);
  return new Date(a, m - 1, d);
}

export function hoyISO(): string {
  const h = new Date();
  return `${h.getFullYear()}-${String(h.getMonth() + 1).padStart(2, "0")}-${String(
    h.getDate(),
  ).padStart(2, "0")}`;
}

/** Peso de archivo legible: importa al navegar con datos móviles. */
export function pesoLegible(bytes: number | null): string | null {
  if (bytes == null) return null;
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
