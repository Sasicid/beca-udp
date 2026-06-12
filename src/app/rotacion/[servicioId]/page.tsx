// Ficha de rotación (spec 3.4): estructura fija para que todas se lean igual.
// Siempre fresco: lo que publica Coordinación se ve al instante (spec v1->v2).
export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Tarjeta, Vacio } from "@/components/ui";
import { getFicha, getHospitales, getMateriales, getServicios, getSesion } from "@/lib/data";
import { pesoLegible } from "@/lib/fechas";

export const metadata = { title: "Ficha de rotación" };

export default async function FichaPage({
  params,
}: {
  params: Promise<{ servicioId: string }>;
}) {
  const sesion = await getSesion();
  if (!sesion) redirect("/login");

  const { servicioId } = await params;
  const [servicios, hospitales, ficha, materiales] = await Promise.all([
    getServicios(),
    getHospitales(),
    getFicha(servicioId),
    getMateriales(),
  ]);
  const servicio = servicios.find((s) => s.id === servicioId);
  if (!servicio) notFound();

  const hospital = hospitales.find((h) => h.id === servicio.hospital_id);
  const vinculado = materiales.filter((m) => m.servicio_id === servicioId);

  return (
    <article className="flex flex-col gap-4">
      <header>
        <p className="text-sm font-medium" style={{ color: servicio.color }}>
          Ficha de rotación
        </p>
        <h1 className="text-2xl font-bold">{servicio.nombre}</h1>
        {hospital && (
          <Link href={`/mas/hospitales/${hospital.id}`} className="text-sm text-udp underline">
            {hospital.nombre}
          </Link>
        )}
      </header>

      {!ficha ? (
        <Vacio>
          Esta ficha aún no tiene contenido. Coordinación puede completarla desde el modo
          edición.
        </Vacio>
      ) : (
        <>
          <Seccion n={1} titulo="Resumen y objetivos de aprendizaje">
            {servicio.descripcion && <p className="mb-1">{servicio.descripcion}</p>}
            {ficha.objetivos}
          </Seccion>
          <Seccion n={2} titulo="Antes de llegar">
            {ficha.antes_de_llegar}
          </Seccion>
          <Seccion n={3} titulo="Claves del servicio">
            {ficha.claves}
          </Seccion>
          <Seccion n={4} titulo="Errores frecuentes">
            {ficha.errores_frecuentes}
          </Seccion>
          <Seccion n={5} titulo="Evaluaciones asociadas">
            {ficha.evaluaciones}
          </Seccion>

          <Seccion n={6} titulo="Contactos">
            {ficha.contactos.length === 0 ? (
              "Sin contactos registrados."
            ) : (
              <ul className="flex flex-col gap-2">
                {ficha.contactos.map((c) => (
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
          </Seccion>

          <Seccion n={7} titulo="Material vinculado">
            {vinculado.length === 0 ? (
              "Sin material vinculado a este servicio."
            ) : (
              <ul className="flex flex-col gap-2">
                {vinculado.map((m) => (
                  <li key={m.id}>
                    <Tarjeta href="/material" className="flex items-center justify-between">
                      <span className="font-medium">{m.titulo}</span>
                      {m.tamano != null && (
                        <span className="text-xs text-atenuado">{pesoLegible(m.tamano)}</span>
                      )}
                    </Tarjeta>
                  </li>
                ))}
              </ul>
            )}
          </Seccion>

          {/* Distingue información vigente de la heredada de años anteriores */}
          <p className="text-xs text-atenuado">
            Última actualización:{" "}
            {new Date(ficha.actualizado_en).toLocaleDateString("es-CL", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </>
      )}
    </article>
  );
}

function Seccion({
  n,
  titulo,
  children,
}: {
  n: number;
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-borde bg-surface p-4">
      <h2 className="mb-2 font-semibold">
        <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-udp-suave text-xs font-bold text-udp">
          {n}
        </span>
        {titulo}
      </h2>
      <div className="text-[0.95rem] leading-relaxed">{children}</div>
    </section>
  );
}
