"use client";

import { useMemo, useState } from "react";
import { Chip, Tarjeta, TituloSeccion, Vacio } from "@/components/ui";
import { pesoLegible } from "@/lib/fechas";
import type { Material, Servicio, TipoMaterial } from "@/lib/types";

const TIPOS: { valor: TipoMaterial; etiqueta: string }[] = [
  { valor: "presentacion", etiqueta: "Presentación" },
  { valor: "paper", etiqueta: "Paper" },
  { valor: "protocolo", etiqueta: "Protocolo" },
  { valor: "guia", etiqueta: "Guía" },
  { valor: "enlace", etiqueta: "Enlace" },
];

const DIAS_RECIENTE = 14;

// Dominios servidos por las suscripciones del Sistema de Bibliotecas UDP.
const DOMINIOS_BIBLIOTECA_UDP = [
  "sibudp.idm.oclc.org",
  "clinicalkey",
  "accessmedicina.mhmedical.com",
  "ebscohost.com",
  "ovid.com",
  "doi.org",
  "sciencedirect.com",
];

function esViaBibliotecaUDP(url: string | null): boolean {
  return url != null && DOMINIOS_BIBLIOTECA_UDP.some((d) => url.includes(d));
}

export default function BuscadorMaterial({
  materiales,
  servicios,
}: {
  materiales: Material[];
  servicios: Servicio[];
}) {
  const [texto, setTexto] = useState("");
  const [tipo, setTipo] = useState<TipoMaterial | "">("");
  const [servicioId, setServicioId] = useState("");

  const filtrados = useMemo(() => {
    const q = texto.trim().toLowerCase();
    return materiales.filter(
      (m) =>
        (!q || m.titulo.toLowerCase().includes(q) || m.tema.toLowerCase().includes(q)) &&
        (!tipo || m.tipo === tipo) &&
        (!servicioId || m.servicio_id === servicioId),
    );
  }, [materiales, texto, tipo, servicioId]);

  const sinFiltros = !texto.trim() && !tipo && !servicioId;
  const recientes = sinFiltros
    ? materiales.filter(
        (m) => Date.now() - new Date(m.creado_en).getTime() < DIAS_RECIENTE * 864e5,
      )
    : [];

  return (
    <>
      <input
        type="search"
        placeholder="Buscar por título o tema…"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        className="min-h-11 w-full rounded-sm border border-borde bg-surface px-3 text-base"
        aria-label="Buscar material"
      />
      <div className="flex gap-2">
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value as TipoMaterial | "")}
          className="min-h-11 flex-1 rounded-sm border border-borde bg-surface px-2 text-sm"
          aria-label="Filtrar por tipo"
        >
          <option value="">Todos los tipos</option>
          {TIPOS.map((t) => (
            <option key={t.valor} value={t.valor}>
              {t.etiqueta}
            </option>
          ))}
        </select>
        <select
          value={servicioId}
          onChange={(e) => setServicioId(e.target.value)}
          className="min-h-11 flex-1 rounded-sm border border-borde bg-surface px-2 text-sm"
          aria-label="Filtrar por rotación"
        >
          <option value="">Todas las rotaciones</option>
          {servicios.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nombre}
            </option>
          ))}
        </select>
      </div>

      {recientes.length > 0 && (
        <>
          <TituloSeccion>Agregado recientemente</TituloSeccion>
          <Lista items={recientes} servicios={servicios} />
        </>
      )}

      <TituloSeccion>
        {sinFiltros ? "Todo el material" : `Resultados (${filtrados.length})`}
      </TituloSeccion>
      {filtrados.length > 0 ? (
        <Lista items={filtrados} servicios={servicios} />
      ) : (
        <Vacio>Nada coincide con la búsqueda. Prueba con menos filtros.</Vacio>
      )}
    </>
  );
}

function Lista({ items, servicios }: { items: Material[]; servicios: Servicio[] }) {
  const porId = new Map(servicios.map((s) => [s.id, s]));
  return (
    <ul className="flex flex-col gap-2">
      {items.map((m) => {
        const servicio = m.servicio_id ? porId.get(m.servicio_id) : undefined;
        const etiquetaTipo = TIPOS.find((t) => t.valor === m.tipo)?.etiqueta ?? m.tipo;
        const esBibliotecaUDP = esViaBibliotecaUDP(m.url_externa);
        return (
          <li key={m.id}>
            <Tarjeta
              href={m.url_externa ?? undefined}
              className={m.url_externa ? "" : "cursor-default"}
            >
              <p className="font-medium">{m.titulo}</p>
              <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-atenuado">
                <Chip>{etiquetaTipo}</Chip>
                {m.tema && <span>{m.tema}</span>}
                {servicio && <Chip color={servicio.color}>{servicio.nombre}</Chip>}
                {m.tamano != null && <span>{pesoLegible(m.tamano)}</span>}
              </p>
              {esBibliotecaUDP && (
                <p className="mt-1.5 text-xs text-udp">
                  Acceso vía biblioteca UDP (base de datos pagada) ↗
                </p>
              )}
            </Tarjeta>
          </li>
        );
      })}
    </ul>
  );
}
