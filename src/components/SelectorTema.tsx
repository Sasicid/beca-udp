"use client";

import { useEffect, useState } from "react";

type Tema = "sistema" | "claro" | "oscuro";

const OPCIONES: { valor: Tema; etiqueta: string }[] = [
  { valor: "sistema", etiqueta: "Sistema" },
  { valor: "claro", etiqueta: "☀️ Día" },
  { valor: "oscuro", etiqueta: "🌙 Noche" },
];

/** Modo día/noche (spec sección 6: "en un turno de noche se agradece"). */
export default function SelectorTema() {
  const [tema, setTema] = useState<Tema>("sistema");

  useEffect(() => {
    const guardado = localStorage.getItem("tema");
    if (guardado === "claro" || guardado === "oscuro") setTema(guardado);
  }, []);

  function elegir(t: Tema) {
    setTema(t);
    if (t === "sistema") {
      localStorage.removeItem("tema");
      delete document.documentElement.dataset.tema;
    } else {
      localStorage.setItem("tema", t);
      document.documentElement.dataset.tema = t;
    }
  }

  return (
    <div role="radiogroup" aria-label="Tema de la aplicación" className="flex gap-2">
      {OPCIONES.map((o) => (
        <button
          key={o.valor}
          role="radio"
          aria-checked={tema === o.valor}
          onClick={() => elegir(o.valor)}
          className={`min-h-11 flex-1 rounded-sm border text-sm font-medium transition-colors ${
            tema === o.valor
              ? "border-udp bg-udp-suave text-udp"
              : "border-borde bg-surface text-atenuado"
          }`}
        >
          {o.etiqueta}
        </button>
      ))}
    </div>
  );
}
