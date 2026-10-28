import { useRef, useState, type FocusEvent, type KeyboardEvent, type ReactNode } from "react";
import { Check, ChevronDown, CircleHelp, Download, FileText, Globe, Presentation, Scale } from "lucide-react";
import { cn } from "@/lib/utils";
import { buildReportText, CHECKLIST, getCaseView, PENDING_SOURCE, STAGE_OPTIONS, STAGE_SUMMARY, type Stage } from "@/lib/donna-case";
import type { DemoPlayer } from "./useDemoPlayer";
import { Bubble, btn } from "./ui";

export const STEPS = ["Cuéntame", "Confirma", "Entiende", "Prepara"] as const;

/** Aparece con una transición breve (desactivada con reduced motion). */
function Reveal({ show, children, className }: { show: boolean; children: ReactNode; className?: string }) {
  if (!show) return null;
  return <div className={cn("panel-enter", className)}>{children}</div>;
}

export function Demo({ player }: { player: DemoPlayer }) {
  const { frame, state, dispatch, done, ref } = player;
  const { step, beat, stage } = frame;
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  /** Pausa temporal mientras el foco de teclado está dentro del módulo; no sustituye la pausa manual. */
  const focusPaused = useRef(false);
  const go = (n: number) => {
    focusPaused.current = false;
    dispatch({ type: "goStep", step: n });
  };
  const onKey = (e: KeyboardEvent) => {
    const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const n = (step + d + STEPS.length) % STEPS.length;
    go(n);
    tabs.current[n]?.focus();
  };
  const onFocusIn = () => {
    if (state.paused || done) return;
    focusPaused.current = true;
    dispatch({ type: "pause" });
  };
  const onFocusOut = (e: FocusEvent<HTMLDivElement>) => {
    if (!focusPaused.current || e.currentTarget.contains(e.relatedTarget as Node | null)) return;
    focusPaused.current = false;
    dispatch({ type: "resume" });
  };

  return (
    <div ref={ref} className="overflow-hidden rounded-xl border border-border bg-card" onFocus={onFocusIn} onBlur={onFocusOut}>
      <div className="border-b border-border px-4 py-2">
        <p className="text-sm text-muted-foreground">Recorrido del producto · Nube Clara</p>
      </div>
      <div role="tablist" aria-label="Pasos de la demo" onKeyDown={onKey} className="grid grid-cols-2 border-b border-border sm:grid-cols-4">
        {STEPS.map((s, i) => (
          <button
            key={s}
            ref={(el) => { tabs.current[i] = el; }}
            role="tab"
            id={`tab-${i}`}
            aria-selected={step === i}
            aria-controls="demo-panel"
            tabIndex={step === i ? 0 : -1}
            onClick={() => go(i)}
            className={cn(
              "flex min-h-12 items-center gap-2 border-b-2 px-4 text-left text-[15px] transition-colors",
              step === i ? "border-primary bg-accent font-semibold text-foreground" : "border-transparent text-muted-foreground hover:bg-muted",
            )}
          >
            <span className="font-serif text-lg text-primary">{i + 1}</span>
            {s}
          </button>
        ))}
      </div>
      <div id="demo-panel" role="tabpanel" aria-labelledby={`tab-${step}`} key={step} className="panel-enter grid min-h-[560px] lg:min-h-[500px] lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <section aria-label="Conversación con Donna" className="flex flex-col gap-4 border-b border-border p-5 sm:p-6 lg:border-b-0 lg:border-r">
          <Conversation step={step} beat={beat} stage={stage} />
        </section>
        <section aria-label="Expediente de Nube Clara" className="bg-background/60 p-5 sm:p-6">
          <Document step={step} beat={beat} stage={stage} />
        </section>
      </div>
    </div>
  );
}

interface View { step: number; beat: number; stage: Stage | null }

function Conversation({ step, beat, stage }: View) {
  if (step === 0)
    return (
      <>
        <Bubble from="donna">Vamos a poner todo en su sitio. Cuéntame de tu negocio: con tu página y tu presentación es suficiente para empezar.</Bubble>
        <Reveal show={beat >= 1}><Bubble from="user">Te comparto nuestra página y el pitch.</Bubble></Reveal>
        <Reveal show={beat >= 2} className="space-y-2">
          <SampleFile icon={Globe} name="nubeclara.mx" excerpt="“Asistentes con IA que responden a los clientes de tu tienda, día y noche.”" />
          <SampleFile icon={Presentation} name="Pitch Nube Clara.pdf" excerpt="“4 personas · Guadalajara · Producto en piloto con comercios locales.”" />
        </Reveal>
      </>
    );
  if (step === 1)
    return (
      <>
        <Bubble from="donna">Antes de ordenar nada, una pregunta. La respuesta solo acomoda tu expediente; no define ninguna obligación.</Bubble>
        <div>
          <p className="mb-2 font-serif text-xl">¿Ya tienes clientes o sigues desarrollando el producto?</p>
          <Reveal show={beat >= 1}>
            <ul className="space-y-2" aria-label="Opciones de respuesta">
              {STAGE_OPTIONS.map((o) => {
                const on = stage === o.value;
                return (
                  <li key={o.value} className={cn(
                    "flex min-h-11 items-center gap-3 rounded-md border px-4 py-2 text-base transition-colors duration-200",
                    on ? "border-primary bg-accent font-semibold" : "border-border-strong bg-card",
                  )}>
                    <span aria-hidden className={cn("grid size-4 place-items-center rounded-full border", on ? "border-primary bg-primary" : "border-border-strong")}>
                      {on && <span className="size-1.5 rounded-full bg-primary-foreground" />}
                    </span>
                    {o.label}
                    {on && <span className="sr-only">(seleccionada)</span>}
                  </li>
                );
              })}
            </ul>
          </Reveal>
        </div>
        <Reveal show={beat >= 3 && !!stage}><Bubble from="user">{STAGE_OPTIONS.find((o) => o.value === stage)?.label}</Bubble></Reveal>
        <Reveal show={beat >= 4 && !!stage}><Bubble from="donna">Anotado: {stage && STAGE_SUMMARY[stage].toLowerCase()} Lo registro como dato, sin sacar conclusiones.</Bubble></Reveal>
      </>
    );
  if (step === 2)
    return (
      <>
        <Bubble from="donna">Separé tu expediente en tres partes: lo que ya sabemos, lo que falta preguntarte y lo que debe ver un profesional.</Bubble>
        <Reveal show={beat >= 4}>
          <Bubble from="donna">Tomé tu respuesta tal cual{stage ? <>: <strong>{STAGE_SUMMARY[stage].toLowerCase()}</strong></> : "."} No saco conclusiones fiscales de eso.</Bubble>
        </Reveal>
      </>
    );
  return (
    <>
      <Bubble from="donna">Vamos a dejarlo claro para tu contador.</Bubble>
      <Reveal show={beat >= 2}><Bubble from="donna">Preparé un resumen y una lista de lo que conviene llevar. Es un borrador para revisión profesional, no una respuesta final.</Bubble></Reveal>
    </>
  );
}

function SampleFile({ icon: Icon, name, excerpt }: { icon: typeof Globe; name: string; excerpt: string }) {
  return (
    <div className="flex gap-3 rounded-md border border-border bg-card p-3">
      <Icon aria-hidden className="mt-0.5 size-5 shrink-0 text-primary" />
      <div className="min-w-0">
        <p className="text-[15px] font-semibold">{name}</p>
        <p className="mt-1 text-sm text-muted-foreground">{excerpt}</p>
      </div>
    </div>
  );
}

function DocHeader({ title }: { title: string }) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
      <div className="flex items-center gap-2">
        <FileText aria-hidden className="size-5 shrink-0 text-primary" />
        <h3 className="font-serif text-xl">{title}</h3>
      </div>
    </div>
  );
}

function Group({ tone, title, items, icon: Icon }: { tone: "ok" | "pending" | "review"; title: string; items: string[]; icon: typeof Check }) {
  const tones = { ok: "bg-success-bg text-success", pending: "bg-muted text-foreground", review: "bg-accent text-primary" };
  return (
    <div>
      <h4 className={cn("mb-2 inline-flex items-center gap-2 rounded-sm px-2 py-1 text-sm font-semibold", tones[tone])}>
        <Icon aria-hidden className="size-4" />{title}
      </h4>
      <ul className="space-y-1.5 pl-1">
        {items.map((i) => <li key={i} className="border-l-2 border-border pl-3 text-[15px]">{i}</li>)}
      </ul>
    </div>
  );
}

function Document({ step, beat, stage }: View) {
  const v = getCaseView(stage);
  const [open, setOpen] = useState<string | null>(null);
  const [hidePreview, setHidePreview] = useState(false);

  if (step === 0)
    return (
      <>
        <DocHeader title="Expediente · Nube Clara" />
        <p className="mb-4 text-sm text-muted-foreground">Así se acomoda lo que cuentas.</p>
        <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-[auto_1fr]">
          {[
            ["Qué hace", "Software con IA para atención a clientes de comercios."],
            ["Equipo", "4 personas en Guadalajara."],
            ["Etapa", "Por confirmar"],
            ["Origen", "Página y pitch"],
          ].map(([k, d]) => (
            <div key={k} className="contents">
              <dt className="text-sm font-semibold text-muted-foreground">{k}</dt>
              <dd className={cn("text-[15px]", d === "Por confirmar" && "text-primary", beat < 3 && "text-muted-foreground")}>
                {beat >= 3 ? <span className="panel-enter inline-block">{d}</span> : "—"}
              </dd>
            </div>
          ))}
        </dl>
      </>
    );
  if (step === 1)
    return (
      <>
        <DocHeader title="Resumen del negocio" />
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm font-semibold text-muted-foreground">Etapa del negocio</p>
          <p key={stage ?? "none"} className="panel-enter mt-1 font-serif text-2xl">{stage ? STAGE_SUMMARY[stage] : "Pendiente de confirmar."}</p>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">Donna registra lo que respondes. Qué significa para tus obligaciones lo decide la revisión con tu contador.</p>
      </>
    );
  if (step === 2)
    return (
      <>
        <DocHeader title="Lo que sabemos y lo que falta" />
        <div className="space-y-5">
          <Reveal show={beat >= 1}><Group tone="ok" icon={Check} title="Datos confirmados" items={v.confirmed} /></Reveal>
          <Reveal show={beat >= 2}><Group tone="pending" icon={CircleHelp} title="Preguntas pendientes" items={v.pending} /></Reveal>
          <Reveal show={beat >= 3}><Group tone="review" icon={Scale} title="Para revisión profesional" items={v.review} /></Reveal>
        </div>
      </>
    );

  const download = () => {
    const blob = new Blob([buildReportText(stage)], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "donna-guia-de-trabajo-nube-clara.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <DocHeader title="Para tu contador" />
      <p className="text-[15px]"><strong>Resumen.</strong> {v.confirmed.join(" ")}</p>
      <p className="mt-2 text-sm text-muted-foreground">{v.pending.length} preguntas pendientes · {v.review.length} asuntos para revisión profesional</p>
      <Reveal show={beat >= 1}>
        <ul className="mt-5 divide-y divide-border rounded-lg border border-border bg-card">
          {CHECKLIST.map((c) => (
            <li key={c.id}>
              <button
                aria-expanded={open === c.id}
                aria-controls={`chk-${c.id}`}
                onClick={() => setOpen(open === c.id ? null : c.id)}
                className="flex min-h-12 w-full items-center justify-between gap-3 px-4 text-left text-[15px] font-semibold hover:bg-muted"
              >
                {c.title}
                <ChevronDown aria-hidden className={cn("size-4 shrink-0 transition-transform", open === c.id && "rotate-180")} />
              </button>
              <p id={`chk-${c.id}`} hidden={open !== c.id} className="px-4 pb-4 text-[15px] text-muted-foreground">{c.detail}</p>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-muted-foreground">Fuente de la oportunidad sugerida: {PENDING_SOURCE}.</p>
      </Reveal>
      <Reveal show={beat >= 2}>
        {!hidePreview && <pre id="report-preview" tabIndex={0} aria-label="Guía de trabajo" className="mt-4 max-h-56 overflow-auto whitespace-pre-wrap rounded-md border border-border bg-card p-4 font-sans text-sm">
          {buildReportText(stage)}
        </pre>}
        <div className="mt-4 flex flex-wrap gap-2">
        <button className={btn.secondary} aria-expanded={!hidePreview} aria-controls="report-preview" onClick={() => setHidePreview(!hidePreview)}>
          {hidePreview ? "Ver resumen" : "Ocultar resumen"}
        </button>
        <button className={btn.primary} onClick={download}>
          <Download aria-hidden className="size-4" />Descargar resumen
        </button>
        </div>
      </Reveal>
    </>
  );
}
