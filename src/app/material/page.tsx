// Material académico (spec 3.5): búsqueda por texto y filtros combinables.
// Siempre fresco: lo que publica Coordinación se ve al instante (spec v1->v2).
export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
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
    </div>
  );
}
