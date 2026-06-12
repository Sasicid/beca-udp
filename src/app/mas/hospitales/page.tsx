// Hospitales (spec 3.7): la lista; la ficha de cada uno queda offline al visitarla.
// Siempre fresco: lo que publica Coordinación se ve al instante (spec v1->v2).
export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { getHospitales, getSesion } from "@/lib/data";

export const metadata = { title: "Hospitales" };

export default async function Hospitales() {
  const sesion = await getSesion();
  if (!sesion) redirect("/login");

  const hospitales = await getHospitales();

  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-xl font-bold">Hospitales</h1>
      <ul className="flex flex-col gap-2">
        {hospitales.map((h) => (
          <li key={h.id}>
            <Link
              href={`/mas/hospitales/${h.id}`}
              className="block rounded-xl border border-borde bg-surface p-4 hover:border-udp-claro"
            >
              <p className="font-semibold">{h.nombre}</p>
              <p className="text-sm text-atenuado">{h.direccion}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
