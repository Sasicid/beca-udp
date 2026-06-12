// Q&A (spec 3.6): banco por tema con destacadas + buzón moderado. Un solo
// editor publica (Coordinación); el banco crece con dudas reales.
// Siempre fresco: lo que publica Coordinación se ve al instante (spec v1->v2).
export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { enviarPregunta } from "@/app/acciones";
import { TituloSeccion, Vacio } from "@/components/ui";
import { getPreguntas, getSesion } from "@/lib/data";

export const metadata = { title: "Preguntas y respuestas" };

export default async function QA() {
  const sesion = await getSesion();
  if (!sesion) redirect("/login");

  const preguntas = (await getPreguntas()).filter((p) => p.estado === "publicada");
  const temas = [...new Set(preguntas.map((p) => p.tema || "General"))];

  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-xl font-bold">Preguntas y respuestas</h1>

      {preguntas.length === 0 && (
        <Vacio>Aún no hay preguntas publicadas. Envía la primera con el buzón de abajo.</Vacio>
      )}

      {temas.map((tema) => (
        <section key={tema}>
          <TituloSeccion>{tema}</TituloSeccion>
          <ul className="flex flex-col gap-2">
            {preguntas
              .filter((p) => (p.tema || "General") === tema)
              .map((p) => (
                <li key={p.id}>
                  <details className="rounded-sm border border-borde bg-surface">
                    <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-2 px-4 py-2 font-medium">
                      <span>
                        {p.destacada && <span aria-label="Destacada">★ </span>}
                        {p.pregunta}
                      </span>
                      <span className="text-atenuado">›</span>
                    </summary>
                    <p className="border-t border-borde px-4 py-3 text-[0.95rem] leading-relaxed">
                      {p.respuesta}
                    </p>
                  </details>
                </li>
              ))}
          </ul>
        </section>
      ))}

      <section className="mt-4 rounded-sm border border-borde bg-surface p-4">
        <h2 className="font-semibold">¿Tienes una duda?</h2>
        <p className="mt-1 text-sm text-atenuado">
          Tu pregunta llega a una cola privada de Coordinación. Si se publica, aparecerá
          en el banco con su respuesta.
        </p>
        <form action={enviarPregunta} className="mt-3 flex flex-col gap-2">
          <textarea
            name="pregunta"
            required
            rows={3}
            placeholder="Escribe tu pregunta…"
            className="w-full rounded-sm border border-borde bg-background p-3 text-base"
          />
          <button
            type="submit"
            className="min-h-11 self-end rounded-sm bg-udp px-5 font-semibold text-white"
          >
            Enviar pregunta
          </button>
        </form>
        {sesion.demo && (
          <p className="mt-2 text-xs text-atenuado">
            En modo demo el buzón no guarda: se activa al conectar Supabase.
          </p>
        )}
      </section>
    </div>
  );
}
