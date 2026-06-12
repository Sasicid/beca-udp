import { describe, expect, it } from "vitest";
import { anioAcademico, anioDeBeca, etiquetaAnioBeca, type FechaCorte } from "./beca";

// Fecha de corte del ejemplo de la spec (sección 5): 1 de abril.
const corteAbril: FechaCorte = { mes: 4, dia: 1 };

const activo = (anioIngreso: number) => ({ anioIngreso, estado: "activo" as const });

describe("anioAcademico", () => {
  it("antes del corte pertenece al año académico anterior", () => {
    expect(anioAcademico(new Date(2026, 2, 31), corteAbril)).toBe(2025); // 31 mar 2026
  });

  it("el día del corte parte el año académico nuevo", () => {
    expect(anioAcademico(new Date(2026, 3, 1), corteAbril)).toBe(2026); // 1 abr 2026
  });

  it("con corte 1 de enero equivale al año calendario", () => {
    expect(anioAcademico(new Date(2026, 0, 1), { mes: 1, dia: 1 })).toBe(2026);
    expect(anioAcademico(new Date(2026, 11, 31), { mes: 1, dia: 1 })).toBe(2026);
  });
});

describe("anioDeBeca — tabla de convivencia de la spec (corte 1 abril)", () => {
  const junio2026 = new Date(2026, 5, 15); // año académico 2026
  const junio2027 = new Date(2027, 5, 15); // año académico 2027

  it("generación 2024: R3 en 2026, egresada en 2027", () => {
    expect(anioDeBeca(activo(2024), corteAbril, junio2026)).toEqual({
      tipo: "residente",
      anio: 3,
      suspendido: false,
    });
    expect(anioDeBeca(activo(2024), corteAbril, junio2027)).toEqual({ tipo: "egresado" });
  });

  it("generación 2025: R2 en 2026, R3 en 2027", () => {
    expect(anioDeBeca(activo(2025), corteAbril, junio2026)).toMatchObject({ anio: 2 });
    expect(anioDeBeca(activo(2025), corteAbril, junio2027)).toMatchObject({ anio: 3 });
  });

  it("generación 2026: R1 en 2026, R2 en 2027", () => {
    expect(anioDeBeca(activo(2026), corteAbril, junio2026)).toMatchObject({ anio: 1 });
    expect(anioDeBeca(activo(2026), corteAbril, junio2027)).toMatchObject({ anio: 2 });
  });

  it("generación 2027 aún no ingresa durante el año académico 2026", () => {
    expect(anioDeBeca(activo(2027), corteAbril, junio2026)).toEqual({ tipo: "no-ingresa" });
  });

  it("el año de beca no avanza el 1 de enero sino en la fecha de corte", () => {
    // Feb 2027 sigue siendo año académico 2026: la generación 2024 todavía es R3.
    expect(anioDeBeca(activo(2024), corteAbril, new Date(2027, 1, 15))).toMatchObject({
      anio: 3,
    });
    // El 1 de abril de 2027 pasa a egresada.
    expect(anioDeBeca(activo(2024), corteAbril, new Date(2027, 3, 1))).toEqual({
      tipo: "egresado",
    });
  });
});

describe("anioDeBeca — estados especiales", () => {
  const hoy = new Date(2027, 5, 15);

  it("suspensión congela el avance en la fecha de suspensión", () => {
    const alumno = {
      anioIngreso: 2024,
      estado: "suspendido" as const,
      suspendidoDesde: new Date(2025, 5, 1), // año académico 2025 → R2
    };
    expect(anioDeBeca(alumno, corteAbril, hoy)).toEqual({
      tipo: "residente",
      anio: 2,
      suspendido: true,
    });
  });

  it("extensión mantiene R3 hasta la fecha de egreso corrida", () => {
    const alumno = {
      anioIngreso: 2024,
      estado: "extendido" as const,
      fechaEgresoOverride: new Date(2027, 9, 1), // 1 oct 2027
    };
    // Sin extensión sería egresado desde abril 2027; con ella sigue R3.
    expect(anioDeBeca(alumno, corteAbril, hoy)).toMatchObject({ anio: 3 });
    expect(anioDeBeca(alumno, corteAbril, new Date(2027, 10, 1))).toEqual({
      tipo: "egresado",
    });
  });

  it("retiro anula el cálculo", () => {
    expect(
      anioDeBeca({ anioIngreso: 2025, estado: "retirado" }, corteAbril, hoy),
    ).toEqual({ tipo: "retirado" });
  });
});

describe("etiquetaAnioBeca", () => {
  it("rotula cada estado", () => {
    expect(etiquetaAnioBeca({ tipo: "residente", anio: 1, suspendido: false })).toBe("R1");
    expect(etiquetaAnioBeca({ tipo: "residente", anio: 2, suspendido: true })).toBe(
      "R2 (suspendido)",
    );
    expect(etiquetaAnioBeca({ tipo: "egresado" })).toBe("Egresado");
    expect(etiquetaAnioBeca({ tipo: "no-ingresa" })).toBe("Aún no ingresa");
    expect(etiquetaAnioBeca({ tipo: "retirado" })).toBe("Retirado");
  });
});
