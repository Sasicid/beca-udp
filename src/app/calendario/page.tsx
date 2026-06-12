// Calendario (spec 3.3): vista personal por defecto; modo "ver todo" con la
// matriz alumno × servicio × mes (acordeón en móvil, tabla en desktop).
// Siempre fresco: lo que publica Coordinación se ve al instante (spec v1->v2).
export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { Chip, Tarjeta, TituloSeccion, Vacio } from "@/components/ui";
import {
  getAlumnos,
  getAsignaciones,
  getEventos,
  getServicios,
  getSesion,
  getTurnos,
  mesesVentana,
} from "@/lib/data";
import { fechaCorta, mesActual, nombreMes } from "@/lib/fechas";
import type { Servicio } from "@/lib/types";

export const metadata = { title: "Calendario" };

export default async function Calendario({
  searchParams,
}: {
  searchParams: Promise<{ vista?: string }>;
}) {
  const sesion = await getSesion();
  if (!sesion) redirect("/login");

  const { vista } = await searchParams;
  const verTodo = vista === "todo";
  const meses = mesesVentana();

  return (
    <div className="flex flex-col gap-3">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Calendario</h1>
        <nav className="flex rounded-lg border border-borde bg-surface p-0.5 text-sm">
          <Link
            href="/calendario"
            className={`min-h-10 rounded-md px-3 leading-10 ${!verTodo ? "bg-udp-suave font-semibold text-udp" : "text-atenuado"}`}
          >
            Personal
          </Link>
          <Link
            href="/calendario?vista=todo"
            className={`min-h-10 rounded-md px-3 leading-10 ${verTodo ? "bg-udp-suave font-semibold text-udp" : "text-atenuado"}`}
          >
            Ver todo
          </Link>
        </nav>
      </header>

      {verTodo ? <Matriz meses={meses} /> : <VistaPersonal meses={meses} />}
    </div>
  );
}

async function VistaPersonal({ meses }: { meses: string[] }) {
  const sesion = (await getSesion())!;
  const alumno = sesion.alumno;
  if (!alumno) {
    return <Vacio>Tu cuenta no está vinculada a un alumno. Avisa a Coordinación.</Vacio>;
  }

  const [servicios, asignaciones, turnos, eventos] = await Promise.all([
    getServicios(),
    getAsignaciones(meses),
    getTurnos(alumno.id),
    getEventos(alumno.id, alumno.generacion_id),
  ]);
  const porId = new Map(servicios.map((s) => [s.id, s]));
  const mias = asignaciones.filter((a) => a.alumno_id === alumno.id);

  return (
    <>
      <TituloSeccion>Mis rotaciones</TituloSeccion>
      <div className="flex flex-col gap-2">
        {meses.map((mes) => {
          const asig = mias.find((a) => a.mes === mes);
          const servicio = asig ? porId.get(asig.servicio_id) : undefined;
          const esActual = mes === mesActual();
          return (
            <Tarjeta
              key={mes}
              href={servicio ? `/rotacion/${servicio.id}` : undefined}
              className={`flex items-center justify-between ${esActual ? "border-udp-claro" : ""}`}
            >
              <span className={esActual ? "font-semibold" : undefined}>
                {nombreMes(mes)}
              </span>
              {servicio ? (
                <Chip color={servicio.color}>{servicio.nombre}</Chip>
              ) : (
                <span className="text-sm text-atenuado">Sin asignar</span>
              )}
            </Tarjeta>
          );
        })}
      </div>

      <TituloSeccion>Mis turnos</TituloSeccion>
      {turnos.length > 0 ? (
        <div className="flex flex-col gap-2">
          {turnos.map((t) => (
            <Tarjeta key={t.id} className="flex items-center justify-between">
              <span>
                <span className="block font-medium">{fechaCorta(t.fecha)}</span>
                <span className="block text-sm text-atenuado">
                  {t.horario}
                  {t.lugar && ` · ${t.lugar}`}
                </span>
              </span>
              {t.nota && <span className="text-xs text-atenuado">{t.nota}</span>}
            </Tarjeta>
          ))}
        </div>
      ) : (
        <Vacio>Sin turnos cargados por ahora.</Vacio>
      )}

      <TituloSeccion>Evaluaciones de mi generación</TituloSeccion>
      {eventos.length > 0 ? (
        <div className="flex flex-col gap-2">
          {eventos.map((e) => (
            <Tarjeta key={e.id}>
              <div className="flex items-center justify-between">
                <p className="font-medium">{e.titulo}</p>
                <span
                  className={`rounded-lg px-2 py-0.5 text-xs font-bold uppercase ${
                    e.tipo === "prueba"
                      ? "bg-urgente-suave text-urgente"
                      : "bg-udp-suave text-udp"
                  }`}
                >
                  {e.tipo === "presentacion" ? "presentación" : e.tipo}
                </span>
              </div>
              <p className="text-sm text-atenuado">{fechaCorta(e.fecha)}</p>
              {e.descripcion && <p className="mt-1 text-sm">{e.descripcion}</p>}
            </Tarjeta>
          ))}
        </div>
      ) : (
        <Vacio>No hay evaluaciones agendadas.</Vacio>
      )}
    </>
  );
}

/** Matriz general: tabla en desktop, acordeón por alumno en móvil (sin scroll
    horizontal interminable). */
async function Matriz({ meses }: { meses: string[] }) {
  const [alumnos, servicios, asignaciones] = await Promise.all([
    getAlumnos(),
    getServicios(),
    getAsignaciones(meses),
  ]);
  const porId = new Map(servicios.map((s) => [s.id, s]));
  const celda = (alumnoId: string, mes: string): Servicio | undefined => {
    const a = asignaciones.find((x) => x.alumno_id === alumnoId && x.mes === mes);
    return a ? porId.get(a.servicio_id) : undefined;
  };
  const activos = alumnos.filter((a) => a.estado !== "retirado");

  return (
    <>
      {/* Móvil: acordeón por alumno */}
      <div className="flex flex-col gap-2 md:hidden">
        {activos.map((al) => (
          <details key={al.id} className="rounded-xl border border-borde bg-surface">
            <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between px-4 font-medium">
              {al.nombre}
              <span className="text-atenuado">›</span>
            </summary>
            <ul className="border-t border-borde px-4 py-2">
              {meses.map((mes) => {
                const s = celda(al.id, mes);
                return (
                  <li key={mes} className="flex min-h-10 items-center justify-between text-sm">
                    <span className="text-atenuado">{nombreMes(mes)}</span>
                    {s ? (
                      <Chip color={s.color}>{s.nombre}</Chip>
                    ) : (
                      <span className="text-atenuado">—</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </details>
        ))}
      </div>

      {/* Desktop: matriz completa */}
      <div className="hidden overflow-x-auto rounded-xl border border-borde bg-surface md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-borde text-left">
              <th className="px-3 py-2 font-semibold">Alumno</th>
              {meses.map((m) => (
                <th key={m} className="px-3 py-2 font-semibold">
                  {nombreMes(m)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {activos.map((al) => (
              <tr key={al.id} className="border-b border-borde last:border-0">
                <td className="px-3 py-2 font-medium">{al.nombre}</td>
                {meses.map((mes) => {
                  const s = celda(al.id, mes);
                  return (
                    <td key={mes} className="px-3 py-2">
                      {s ? <Chip color={s.color}>{s.nombre}</Chip> : <span className="text-atenuado">—</span>}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
