import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Comparison } from "@/components/donna/Comparison";

describe("Sección de comparación", () => {
  it("renderiza una sola sección con el copy aprobado", () => {
    const { container } = render(<Comparison />);
    expect(container.querySelectorAll("section")).toHaveLength(1);
    expect(screen.getByRole("heading", { name: /Una respuesta te informa/ })).toBeInTheDocument();
    expect(screen.getByText(/organizar mejor los impuestos de mi negocio/)).toBeInTheDocument();
    expect(screen.getByText("Dos formas de abordar la misma pregunta.")).toBeInTheDocument();
    expect(screen.getByText("Consulta genérica")).toBeInTheDocument();
    expect(screen.getByText("Con Donna")).toBeInTheDocument();
    expect(screen.getByText("Depende de tu situación. Consulta a un contador.")).toBeInTheDocument();
    expect(screen.getByText(/El contexto, los pendientes y la evidencia quedan organizados/)).toBeInTheDocument();
    expect(screen.getByText("Llega a tu contador con algo más que preguntas.")).toBeInTheDocument();
  });

  it("la pregunta compartida aparece una sola vez", () => {
    const { container } = render(<Comparison />);
    const html = container.innerHTML;
    expect(html.match(/organizar mejor los impuestos de mi negocio/g)).toHaveLength(1);
  });
});
