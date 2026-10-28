import { Check } from "lucide-react";
import { DonnaMark } from "./ui";

export function Comparison() {
  return (
    <section aria-labelledby="h-comparacion" className="mx-auto max-w-6xl px-5 py-20 lg:py-24">
      <h2 id="h-comparacion" className="text-section max-w-2xl">
        Una respuesta te informa. <span className="text-primary">Un expediente te ayuda a avanzar.</span>
      </h2>
      <p className="mt-3 text-muted-foreground">Dos formas de abordar la misma pregunta.</p>

      <div className="mt-10 border-l-2 border-copper pl-5">
        <p className="text-sm font-semibold text-muted-foreground">La pregunta</p>
        <p className="mt-1 max-w-2xl font-serif text-[22px] leading-snug tracking-[-0.015em] lg:text-[24px]">
          “¿Cómo puedo organizar mejor los impuestos de mi negocio?”
        </p>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2 lg:gap-8">
        <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
          <h3 className="font-serif text-[22px] tracking-[-0.015em] text-muted-foreground">Consulta genérica</h3>
          <p className="mt-4 text-[16px] text-muted-foreground">Depende de tu situación. Consulta a un contador.</p>
          <p className="mt-6 border-t border-border pt-5 text-[16px] text-muted-foreground">
            <span className="block text-sm font-semibold">Resultado</span>
            <span className="mt-1 block">Tú reúnes el contexto y conectas las respuestas.</span>
          </p>
        </div>
        <div className="rounded-xl border-2 border-primary bg-accent p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <DonnaMark />
            <h3 className="font-serif text-[22px] tracking-[-0.015em]">Con Donna</h3>
          </div>
          <p className="mt-4 text-[16px]">
            Primero ordenemos cómo cobras, dónde operas y qué gastos tienes. Prepararemos las preguntas, los documentos
            y las fuentes que tu contador necesita para evaluar alternativas.
          </p>
          <p className="mt-6 border-t border-primary/30 pt-5 text-[16px]">
            <span className="block text-sm font-semibold text-muted-foreground">Resultado</span>
            <span className="mt-1 flex gap-3 font-medium">
              <Check aria-hidden className="mt-1 size-4 shrink-0 text-primary" />
              El contexto, los pendientes y la evidencia quedan organizados para revisión.
            </span>
          </p>
        </div>
      </div>

      <p className="mt-12 max-w-2xl font-serif text-[24px] leading-snug tracking-[-0.015em] lg:text-[28px]">
        Llega a tu contador con algo más que preguntas.
      </p>
    </section>
  );
}
