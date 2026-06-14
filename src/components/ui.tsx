import Link from "next/link";
import type { ReactNode } from "react";

/** Tarjeta estándar; si lleva href, toda la tarjeta es área táctil. */
export function Tarjeta({
  href,
  children,
  className = "",
}: {
  href?: string;
  children: ReactNode;
  className?: string;
}) {
  const base = `block rounded-sm border border-borde bg-surface p-4 ${className}`;
  if (href) {
    // Transición específica (no `all`), ease-out, elevación leve al pasar el cursor.
    const conHover =
      `${base} [transition:border-color_180ms_ease-out,box-shadow_180ms_ease-out,transform_180ms_ease-out] ` +
      `hover:border-udp-claro hover:-translate-y-0.5 hover:shadow-[0_6px_20px_-12px_rgba(0,0,0,0.35)]`;
    if (href.startsWith("http")) {
      return (
        <a href={href} target="_blank" rel="noreferrer" className={conHover}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={conHover}>
        {children}
      </Link>
    );
  }
  return <div className={base}>{children}</div>;
}

export function TituloSeccion({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-2 mt-6 border-t border-borde pt-4 font-serif text-base uppercase tracking-[0.14em] first:mt-0 first:border-t-0 first:pt-0">
      {children}
    </h2>
  );
}

export function Chip({
  children,
  color,
}: {
  children: ReactNode;
  color?: string; // color fijo por servicio
}) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full bg-udp-suave px-2.5 py-0.5 text-xs font-medium"
      style={color ? { backgroundColor: `${color}1f`, color } : undefined}
    >
      {color && (
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      )}
      {children}
    </span>
  );
}

/** Bloque de carga: imita la forma del contenido, no un spinner suelto. */
export function CargandoLista({ filas = 4, titulo = true }: { filas?: number; titulo?: boolean }) {
  return (
    <div className="flex flex-col gap-3" aria-busy="true" aria-label="Cargando">
      {titulo && <span className="skeleton h-7 w-40" />}
      {Array.from({ length: filas }).map((_, i) => (
        <span key={i} className="skeleton h-20 w-full rounded-sm" />
      ))}
    </div>
  );
}

/** Pantalla vacía que indica qué hacer (spec sección 6). */
export function Vacio({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-sm border border-dashed border-borde p-6 text-center text-sm text-atenuado">
      {children}
    </p>
  );
}
