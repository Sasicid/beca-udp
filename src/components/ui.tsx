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
  const base = `block rounded-xl border border-borde bg-surface p-4 ${className}`;
  if (href) {
    const conHover = `${base} transition-colors hover:border-udp-claro`;
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
    <h2 className="mb-2 mt-6 text-sm font-semibold uppercase tracking-wide text-atenuado first:mt-0">
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

/** Pantalla vacía que indica qué hacer (spec sección 6). */
export function Vacio({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed border-borde p-6 text-center text-sm text-atenuado">
      {children}
    </p>
  );
}
