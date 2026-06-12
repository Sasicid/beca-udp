"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const pestanas = [
  { href: "/", titulo: "Hoy", icono: IconoHoy },
  { href: "/calendario", titulo: "Calendario", icono: IconoCalendario },
  { href: "/rotacion", titulo: "Rotación", icono: IconoRotacion },
  { href: "/material", titulo: "Material", icono: IconoMaterial },
  { href: "/mas", titulo: "Más", icono: IconoMas },
];

function activa(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

/** Sello institucional: wordmark udp en rojo + nombre completo. */
export function MarcaUDP({ compacta = false }: { compacta?: boolean }) {
  return (
    <span className={compacta ? "flex items-baseline gap-2" : "block"}>
      <span
        className={`font-sans font-extrabold lowercase leading-none tracking-tight text-udp ${
          compacta ? "text-2xl" : "text-4xl"
        }`}
      >
        udp
      </span>
      <span
        className={`font-sans font-semibold uppercase leading-tight tracking-[0.08em] text-foreground ${
          compacta ? "text-[10px]" : "mt-1 block text-[11px]"
        }`}
      >
        Universidad
        {compacta ? " " : <br />}
        Diego Portales
      </span>
    </span>
  );
}

/** Barra inferior en móvil, lateral en desktop. Áreas táctiles ≥ 44 px. */
export default function Nav() {
  const pathname = usePathname();
  if (pathname.startsWith("/login")) return null;

  return (
    <>
      {/* Móvil: cabecera institucional */}
      <header className="sticky top-0 z-40 border-b border-borde bg-surface md:hidden">
        <Link href="/" className="flex min-h-12 items-center justify-between px-4">
          <MarcaUDP compacta />
          <span className="text-right font-serif text-sm leading-tight text-atenuado">
            Beca Medicina
            <br />
            de Urgencia
          </span>
        </Link>
      </header>

      {/* Móvil: barra inferior alcanzable con el pulgar */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-borde bg-surface pb-[env(safe-area-inset-bottom)] md:hidden">
        <ul className="flex">
          {pestanas.map(({ href, titulo, icono: Icono }) => {
            const act = activa(pathname, href);
            return (
              <li key={href} className="flex-1">
                <Link
                  href={href}
                  className={`flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs ${
                    act ? "font-semibold text-udp" : "text-atenuado"
                  }`}
                >
                  <Icono />
                  {titulo}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Desktop: barra lateral fija */}
      <nav className="fixed inset-y-0 left-0 z-40 hidden w-56 flex-col border-r border-borde bg-surface md:flex">
        <div className="px-5 py-6">
          <Link href="/" className="block">
            <MarcaUDP />
            <span className="mt-4 block border-t border-borde pt-3 font-serif text-base leading-snug">
              Beca Medicina
              <br />
              de Urgencia
            </span>
          </Link>
        </div>
        <ul className="flex flex-col gap-1 px-3">
          {pestanas.map(({ href, titulo, icono: Icono }) => {
            const act = activa(pathname, href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`flex min-h-11 items-center gap-3 rounded-sm px-3 text-sm ${
                    act
                      ? "bg-udp-suave font-semibold text-udp"
                      : "text-foreground hover:bg-udp-suave/60"
                  }`}
                >
                  <Icono />
                  {titulo}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}

const svg = "h-6 w-6 shrink-0";

function IconoHoy() {
  return (
    <svg className={svg} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 11.5 12 4l9 7.5M5.5 9.5V20h13V9.5" />
    </svg>
  );
}
function IconoCalendario() {
  return (
    <svg className={svg} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <rect x="3.5" y="5" width="17" height="15" rx="2" />
      <path strokeLinecap="round" d="M3.5 9.5h17M8 3v4M16 3v4" />
    </svg>
  );
}
function IconoRotacion() {
  return (
    <svg className={svg} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 12a8 8 0 0 1 13.6-5.7M20 12a8 8 0 0 1-13.6 5.7" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.5 2.5v4h-4M6.5 21.5v-4h4" />
    </svg>
  );
}
function IconoMaterial() {
  return (
    <svg className={svg} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.5C10.5 5 8.5 4.5 5 4.5v14c3.5 0 5.5.5 7 2 1.5-1.5 3.5-2 7-2v-14c-3.5 0-5.5.5-7 2Zm0 0v14" />
    </svg>
  );
}
function IconoMas() {
  return (
    <svg className={svg} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <circle cx="5" cy="12" r="1.8" />
      <circle cx="12" cy="12" r="1.8" />
      <circle cx="19" cy="12" r="1.8" />
    </svg>
  );
}
