// Pestaña "Más" (spec 3.2): Q&A, hospitales, avisos archivados y perfil.
// Siempre fresco: lo que publica Coordinación se ve al instante (spec v1->v2).
export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { etiquetaAnioBeca } from "@/lib/beca";
import { getSesion } from "@/lib/data";

export const metadata = { title: "Más" };

const entradas = [
  { href: "/mas/avisos", titulo: "Avisos", detalle: "Vigentes y archivo histórico" },
  { href: "/mas/qa", titulo: "Preguntas y respuestas", detalle: "Banco por tema + buzón" },
  { href: "/mas/hospitales", titulo: "Hospitales", detalle: "Cómo llegar, contactos, datos prácticos" },
];

export default async function Mas() {
  const sesion = await getSesion();
  if (!sesion) redirect("/login");

  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-xl font-bold">Más</h1>

      <ul className="flex flex-col gap-2">
        {entradas.map((e) => (
          <li key={e.href}>
            <Link
              href={e.href}
              className="flex min-h-14 items-center justify-between rounded-xl border border-borde bg-surface px-4 hover:border-udp-claro"
            >
              <span>
                <span className="block font-medium">{e.titulo}</span>
                <span className="block text-sm text-atenuado">{e.detalle}</span>
              </span>
              <span className="text-atenuado">›</span>
            </Link>
          </li>
        ))}
      </ul>

      <section className="mt-4 rounded-xl border border-borde bg-surface p-4">
        <h2 className="font-semibold">Mi perfil</h2>
        <p className="mt-1 text-sm">
          {sesion.nombre}
          {sesion.alumno && (
            <>
              {" · "}
              {etiquetaAnioBeca(sesion.alumno.anioBeca)} · Generación{" "}
              {sesion.alumno.anioIngreso}
            </>
          )}
        </p>
        <p className="text-sm text-atenuado">{sesion.alumno?.email}</p>
      </section>
    </div>
  );
}
