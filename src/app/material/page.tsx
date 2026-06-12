// Material académico (spec 3.5): búsqueda por texto y filtros combinables.
// Siempre fresco: lo que publica Coordinación se ve al instante (spec v1->v2).
export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { TituloSeccion } from "@/components/ui";
import { ACCESO_REMOTO_UDP, basesDatosSalud } from "@/lib/bibliotecas-udp";
import { getMateriales, getServicios, getSesion } from "@/lib/data";
import BuscadorMaterial from "./BuscadorMaterial";

export const metadata = { title: "Material" };

export default async function Material() {
  const sesion = await getSesion();
  if (!sesion) redirect("/login");

  const [materiales, servicios] = await Promise.all([getMateriales(), getServicios()]);

  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-xl font-bold">Material académico</h1>
      <BuscadorMaterial materiales={materiales} servicios={servicios} />

      {/* Bases pagadas: se enlazan, no se suben (spec 3.5) */}
      <TituloSeccion>Bases de datos · Biblioteca UDP</TituloSeccion>
      <ul className="grid gap-2 sm:grid-cols-2">
        {basesDatosSalud.map((b) => (
          <li key={b.nombre}>
            <a
              href={b.url}
              target="_blank"
              rel="noreferrer"
              className="block h-full rounded-sm border border-borde bg-surface p-4 transition-colors hover:border-udp-claro"
            >
              <p className="font-medium">{b.nombre} ↗</p>
              <p className="mt-0.5 text-sm text-atenuado">{b.descripcion}</p>
            </a>
          </li>
        ))}
      </ul>
      <p className="text-xs text-atenuado">
        Fuera de la red UDP, primero activa el{" "}
        <a href={ACCESO_REMOTO_UDP} target="_blank" rel="noreferrer" className="text-udp underline">
          acceso remoto de Bibliotecas UDP
        </a>{" "}
        con tu cuenta institucional.
      </p>
    </div>
  );
}
