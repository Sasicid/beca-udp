// Avisos (spec 3.8): tres estados (normal, fijado, urgente), marcado de
// lectura por usuario y archivo histórico.
// Siempre fresco: lo que publica Coordinación se ve al instante (spec v1->v2).
export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { marcarAvisoLeido } from "@/app/acciones";
import { TituloSeccion, Vacio } from "@/components/ui";
import { getAvisos, getSesion } from "@/lib/data";
import type { Aviso } from "@/lib/types";

export const metadata = { title: "Avisos" };

export default async function Avisos() {
  const sesion = await getSesion();
  if (!sesion) redirect("/login");

  const avisos = await getAvisos(sesion.userId);
  const vigentes = avisos.filter((a) => !a.archivado);
  const orden = (a: Aviso) => (a.urgente && !a.leido ? 0 : a.fijado ? 1 : 2);
  vigentes.sort((a, b) => orden(a) - orden(b) || b.creado_en.localeCompare(a.creado_en));
  const archivados = avisos.filter((a) => a.archivado);

  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-xl font-bold">Avisos</h1>

      {vigentes.length === 0 && <Vacio>No hay avisos publicados.</Vacio>}

      <ul className="flex flex-col gap-2">
        {vigentes.map((a) => (
          <li
            key={a.id}
            className={`rounded-sm border bg-surface p-4 ${
              a.urgente && !a.leido ? "border-urgente bg-urgente-suave" : "border-borde"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="font-semibold">{a.titulo}</p>
              <span className="flex shrink-0 gap-1">
                {a.urgente && (
                  <span className="rounded bg-urgente px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">
                    Urgente
                  </span>
                )}
                {a.fijado && (
                  <span className="rounded bg-udp px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">
                    Fijado
                  </span>
                )}
              </span>
            </div>
            <p className="mt-1 text-sm leading-relaxed">{a.cuerpo}</p>
            <div className="mt-2 flex items-center justify-between">
              <time className="text-xs text-atenuado">
                {new Date(a.creado_en).toLocaleDateString("es-CL", {
                  day: "numeric",
                  month: "short",
                })}
              </time>
              {!a.leido ? (
                <form action={marcarAvisoLeido.bind(null, a.id)}>
                  <button
                    type="submit"
                    className="min-h-9 rounded-sm border border-borde bg-surface px-3 text-xs font-medium"
                  >
                    Marcar como leído
                  </button>
                </form>
              ) : (
                <span className="text-xs text-atenuado">Leído ✓</span>
              )}
            </div>
          </li>
        ))}
      </ul>

      {archivados.length > 0 && (
        <>
          <TituloSeccion>Archivo histórico</TituloSeccion>
          <ul className="flex flex-col gap-2">
            {archivados.map((a) => (
              <li key={a.id} className="rounded-sm border border-borde bg-surface p-4 opacity-70">
                <p className="font-medium">{a.titulo}</p>
                <p className="mt-1 text-sm text-atenuado">{a.cuerpo}</p>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
