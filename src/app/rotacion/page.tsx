// Pestaña "Rotación": lleva directo a la ficha de mi rotación del mes.
// Siempre fresco: lo que publica Coordinación se ve al instante (spec v1->v2).
export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { Vacio } from "@/components/ui";
import { getAsignaciones, getServicios, getSesion } from "@/lib/data";
import { mesActual } from "@/lib/fechas";

export const metadata = { title: "Mi rotación" };

export default async function Rotacion() {
  const sesion = await getSesion();
  if (!sesion) redirect("/login");

  if (sesion.alumno) {
    const asignaciones = await getAsignaciones([mesActual()]);
    const mia = asignaciones.find((a) => a.alumno_id === sesion.alumno!.id);
    if (mia) redirect(`/rotacion/${mia.servicio_id}`);
  }

  const servicios = await getServicios();
  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-xl font-bold">Rotación</h1>
      <Vacio>
        No tienes rotación asignada este mes. Puedes revisar las fichas de los servicios:
      </Vacio>
      <ul className="flex flex-col gap-2">
        {servicios.map((s) => (
          <li key={s.id}>
            <Link
              href={`/rotacion/${s.id}`}
              className="flex min-h-12 items-center rounded-xl border border-borde bg-surface px-4 font-medium hover:border-udp-claro"
            >
              {s.nombre}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
