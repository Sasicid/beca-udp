// Pantalla "Hoy" (spec 3.1): en menos de cinco segundos el becado sabe dónde
// rota este mes, qué turno tiene y qué se le viene encima.
// Siempre fresco: lo que publica Coordinación se ve al instante (spec v1->v2).
export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { Chip, Tarjeta, TituloSeccion, Vacio } from "@/components/ui";
import { etiquetaAnioBeca } from "@/lib/beca";
import { getDatosHoy, getSesion } from "@/lib/data";
import { fechaCorta, fechaLarga, nombreMes, mesActual } from "@/lib/fechas";

export default async function Hoy() {
  const sesion = await getSesion();
  if (!sesion) redirect("/login");

  const { avisoUrgente, rotacion, proximoTurno, hitos, avisosNoLeidos } =
    await getDatosHoy(sesion);

  return (
    <div className="flex flex-col gap-3">
      {sesion.demo && (
        <p className="rounded-sm bg-udp-suave px-3 py-2 text-xs text-atenuado">
          Modo demostración con datos de ejemplo — Supabase sin configurar.
        </p>
      )}

      <header className="mb-1">
        <h1 className="text-xl font-bold">Hola, {sesion.nombre.split(" ")[0]}</h1>
        {sesion.alumno && (
          <p className="text-sm text-atenuado">
            {etiquetaAnioBeca(sesion.alumno.anioBeca)} · Generación{" "}
            {sesion.alumno.anioIngreso}
          </p>
        )}
      </header>

      {/* 1. Banner urgente, solo si existe uno sin leer */}
      {avisoUrgente && (
        <Tarjeta href="/mas/avisos" className="border-urgente bg-urgente-suave">
          <p className="text-xs font-bold uppercase tracking-wide text-urgente">
            Aviso urgente
          </p>
          <p className="mt-1 font-semibold">{avisoUrgente.titulo}</p>
          <p className="mt-1 text-sm">{avisoUrgente.cuerpo}</p>
        </Tarjeta>
      )}

      {/* 2. Mi rotación del mes */}
      <TituloSeccion>Mi rotación · {nombreMes(mesActual())}</TituloSeccion>
      {rotacion ? (
        <Tarjeta href={`/rotacion/${rotacion.servicio.id}`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-lg font-semibold">{rotacion.servicio.nombre}</p>
              {rotacion.hospital && (
                <p className="text-sm text-atenuado">{rotacion.hospital.nombre}</p>
              )}
            </div>
            <Chip color={rotacion.servicio.color}>Ficha</Chip>
          </div>
        </Tarjeta>
      ) : (
        <Vacio>Aún no hay rotación asignada para este mes.</Vacio>
      )}

      {/* 3. Mi próximo turno */}
      <TituloSeccion>Mi próximo turno</TituloSeccion>
      {proximoTurno ? (
        <Tarjeta href="/calendario">
          <p className="font-semibold">{fechaLarga(proximoTurno.fecha)}</p>
          <p className="text-sm text-atenuado">
            {proximoTurno.horario}
            {proximoTurno.lugar && ` · ${proximoTurno.lugar}`}
          </p>
          {proximoTurno.nota && <p className="mt-1 text-sm">{proximoTurno.nota}</p>}
        </Tarjeta>
      ) : (
        <Vacio>Sin turnos cargados por ahora.</Vacio>
      )}

      {/* 4. Próximos hitos de mi generación */}
      <TituloSeccion>Próximos hitos</TituloSeccion>
      {hitos.length > 0 ? (
        <div className="flex flex-col gap-2">
          {hitos.map((h) => (
            <Tarjeta key={h.id} href="/calendario" className="flex items-center gap-3">
              <span
                className={`rounded-sm px-2 py-1 text-xs font-bold uppercase ${
                  h.tipo === "prueba"
                    ? "bg-urgente-suave text-urgente"
                    : "bg-udp-suave text-udp"
                }`}
              >
                {h.tipo === "prueba" ? "Prueba" : h.tipo === "presentacion" ? "Present." : "Hito"}
              </span>
              <span className="flex-1">
                <span className="block font-medium">{h.titulo}</span>
                <span className="block text-sm text-atenuado">
                  {fechaCorta(h.fecha)}
                </span>
              </span>
            </Tarjeta>
          ))}
        </div>
      ) : (
        <Vacio>No hay pruebas ni presentaciones agendadas.</Vacio>
      )}

      {/* 5. Avisos recientes no leídos */}
      <TituloSeccion>Avisos sin leer</TituloSeccion>
      {avisosNoLeidos.length > 0 ? (
        <div className="flex flex-col gap-2">
          {avisosNoLeidos.map((a) => (
            <Tarjeta key={a.id} href="/mas/avisos">
              <p className="font-medium">{a.titulo}</p>
              <p className="mt-0.5 line-clamp-2 text-sm text-atenuado">{a.cuerpo}</p>
            </Tarjeta>
          ))}
        </div>
      ) : (
        <Vacio>Estás al día con los avisos.</Vacio>
      )}
    </div>
  );
}
