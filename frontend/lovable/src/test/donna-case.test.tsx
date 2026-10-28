import { describe, expect, it } from "vitest";
import { buildReportText, getCaseView, PENDING_SOURCE } from "@/lib/donna-case";

describe("Caso Nube Clara", () => {
  it("sin respuesta, la etapa queda como pendiente y no como confirmada", () => {
    const v = getCaseView(null);
    expect(v.pending[0]).toMatch(/Etapa del negocio/);
    expect(v.confirmed.join(" ")).not.toMatch(/clientes\./);
  });

  it("'Ya tengo clientes' se refleja como dato confirmado", () => {
    expect(getCaseView("clientes").confirmed).toContain("Nube Clara indica que ya tiene clientes.");
  });

  it("'No estoy seguro' no confirma nada sobre la etapa", () => {
    const v = getCaseView("incierto");
    expect(v.confirmed.some((c) => c.includes("indica"))).toBe(false);
    expect(v.pending[0]).toMatch(/pilotos/);
  });

  it("la guía descargable es para revisión profesional y no inventa fuentes", () => {
    const t = buildReportText("desarrollo");
    expect(t).toContain("GUÍA DE TRABAJO — PARA REVISIÓN PROFESIONAL");
    expect(t).toContain("No es un dictamen");
    expect(t).toContain(PENDING_SOURCE);
    expect(t).not.toMatch(/art[ií]culo\s+\d/i);
    expect(t).not.toMatch(/\d+\s?%/);
  });
});
