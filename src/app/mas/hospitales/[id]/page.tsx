// Ficha de hospital (spec 3.7): mapas, llamada directa e indicaciones internas.
// Siempre fresco: lo que publica Coordinación se ve al instante (spec v1->v2).
export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import { getHospitales, getSesion } from "@/lib/data";

export const metadata = { title: "Hospital" };

export default async function HospitalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const sesion = await getSesion();
  if (!sesion) redirect("/login");

  const { id } = await params;
  const hospital = (await getHospitales()).find((h) => h.id === id);
  if (!hospital) notFound();

  return (
    <article className="flex flex-col gap-4">
      <header>
        <h1 className="text-2xl font-bold">{hospital.nombre}</h1>
        <p className="text-atenuado">{hospital.direccion}</p>
      </header>

      {hospital.maps_url && (
        <a
          href={hospital.maps_url}
          target="_blank"
          rel="noreferrer"
          className="flex min-h-12 items-center justify-center rounded-xl bg-udp font-semibold text-white"
        >
          Abrir en Google Maps / Waze
        </a>
      )}

      <section className="rounded-xl border border-borde bg-surface p-4">
        <h2 className="mb-2 font-semibold">Contactos</h2>
        {hospital.contactos.length === 0 ? (
          <p className="text-sm text-atenuado">Sin contactos registrados.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {hospital.contactos.map((c) => (
              <li key={c.nombre} className="flex items-center justify-between gap-2">
                <span>
                  <span className="block font-medium">{c.nombre}</span>
                  {c.cargo && <span className="block text-sm text-atenuado">{c.cargo}</span>}
                </span>
                {c.telefono && (
                  <a
                    href={`tel:${c.telefono}`}
                    className="flex min-h-11 items-center rounded-lg bg-udp px-4 text-sm font-semibold text-white"
                  >
                    Llamar
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-xl border border-borde bg-surface p-4">
        <h2 className="mb-2 font-semibold">Indicaciones internas</h2>
        <p className="text-[0.95rem] leading-relaxed">{hospital.indicaciones}</p>
      </section>
    </article>
  );
}
