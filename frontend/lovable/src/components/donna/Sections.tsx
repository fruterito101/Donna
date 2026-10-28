import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown, ChevronRight, CircleHelp, Menu, Scale, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { PENDING_SOURCE } from "@/lib/donna-case";
import { btn } from "./ui";

const NAV = [
  { href: "#temas", label: "Qué puedes resolver" },
  { href: "#recorrido", label: "Así trabaja" },
  { href: "#preguntas", label: "Preguntas" },
];

export function Header({ onDemo }: { onDemo: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background">
      <nav aria-label="Principal" className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
        <a href="#inicio" className="font-serif text-[26px] tracking-[-0.02em] text-foreground">Donna</a>
        <ul className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <li key={n.href}><a href={n.href} className="inline-flex min-h-11 items-center px-3 text-[15px] text-muted-foreground hover:text-foreground">{n.label}</a></li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          <Button asChild variant="link" className="hidden min-h-11 md:inline-flex"><Link to="/app">Abrir Donna</Link></Button>
          <a href="#recorrido" onClick={onDemo} className={cn(btn.primary, "hidden sm:inline-flex")}>Conoce a Donna</a>
          <button className="grid size-11 place-items-center rounded-md md:hidden" aria-expanded={open} aria-controls="menu-movil" aria-label={open ? "Cerrar menú" : "Abrir menú"} onClick={() => setOpen(!open)}>
            {open ? <X aria-hidden className="size-5" /> : <Menu aria-hidden className="size-5" />}
          </button>
        </div>
      </nav>
      {open && (
        <ul id="menu-movil" className="border-t border-border px-5 py-3 md:hidden">
          {NAV.map((n) => (
            <li key={n.href}><a href={n.href} onClick={() => setOpen(false)} className="flex min-h-11 items-center text-base">{n.label}</a></li>
          ))}
          <li className="pt-2"><a href="#recorrido" onClick={() => { onDemo(); setOpen(false); }} className={cn(btn.primary, "w-full")}>Conoce a Donna</a></li>
          <li><Button asChild variant="link" className="min-h-11 w-full"><Link to="/app" onClick={() => setOpen(false)}>Abrir Donna</Link></Button></li>
        </ul>
      )}
    </header>
  );
}

const BENEFITS = [
  ["Entiende tus opciones", "Qué revisar y qué preguntar, en lenguaje claro."],
  ["Ordena tus documentos", "Lo que tienes y lo que falta, en un solo expediente."],
  ["Ahorra tiempo de preparación", "Llega a la reunión con el trabajo adelantado."],
];

export function Hero({ onStart }: { onStart: () => void }) {
  return (
    <section id="inicio" aria-labelledby="titulo" className="mx-auto grid max-w-6xl gap-10 px-5 pb-16 pt-10 lg:grid-cols-12 lg:gap-12 lg:pb-24 lg:pt-16">
      <div className="lg:col-span-7">
        <h1 id="titulo" className="text-display">
          Sabes de código. De producto. <span className="block text-primary">¿Y de leyes?</span>
        </h1>
        <p className="mt-6 max-w-xl font-serif text-[24px] leading-snug tracking-[-0.015em] lg:text-[28px]">
          Donna te ayuda a preparar el trabajo para tu contador o abogado.
        </p>
        <p className="mt-4 max-w-lg text-muted-foreground">
          Entiende qué revisar, reúne la información que falta y llega a la reunión con un expediente claro. Menos idas y vueltas. Más tiempo para construir.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href="#recorrido" onClick={onStart} className={btn.primary}>Conoce a Donna</a>
          <a href="#temas" className={btn.secondary}>Qué puedes resolver</a>
        </div>
      </div>

      <div className="lg:col-span-5 lg:self-end">
        <h2 className="sr-only">Lo que obtienes</h2>
        <ol className="border-t-2 border-ink">
          {BENEFITS.map(([t, d], i) => (
            <li key={t} className="grid grid-cols-[3rem_1fr] border-b border-border py-5">
              <span aria-hidden className="font-serif text-[28px] leading-none text-copper">{i + 1}</span>
              <div>
                <h3 className="font-serif text-[22px] leading-tight tracking-[-0.015em]">{t}</h3>
                <p className="mt-1 text-[15px] text-muted-foreground">{d}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-sm text-muted-foreground">Para devs, builders, freelancers de software y founders en México.</p>
      </div>
    </section>
  );
}

const TOPICS = [
  {
    title: "Estrategias fiscales para ti y tus clientes",
    benefit: "Ordena tu actividad, ingresos y preguntas para explorar alternativas con tu contador.",
    deliverable: "Resumen y preguntas para evaluar opciones fiscales.",
    gathers: ["Tus fuentes de ingreso y cómo cobras", "Gastos ligados a tu actividad", "Preguntas abiertas para tu contador"],
    reviewer: "Tu contador",
  },
  {
    title: "Estructura de tu empresa",
    benefit: "Aclara socios, responsabilidades y planes de crecimiento antes de definir la estructura con tu abogado.",
    deliverable: "Mapa del negocio y decisiones por resolver.",
    gathers: ["Quiénes son los socios y qué aporta cada uno", "Planes de inversión o crecimiento", "Decisiones que aún no tomas"],
    reviewer: "Tu abogado",
  },
  {
    title: "Contratos para trabajar con claridad",
    benefit: "Prepara el contexto y los puntos que quieres revisar antes de firmar con clientes o proveedores.",
    deliverable: "Checklist para la revisión del contrato.",
    gathers: ["Qué entregas y cómo se paga", "Lo que te preocupa del borrador", "Los puntos que quieres negociar"],
    reviewer: "Tu abogado",
  },
  {
    title: "Protege lo que construyes",
    benefit: "Organiza información sobre código, marca y acuerdos del equipo para revisar su protección.",
    deliverable: "Inventario de activos y documentación.",
    gathers: ["Repositorios y quién participó en ellos", "Nombre, marca y dominios", "Acuerdos con equipo y colaboradores"],
    reviewer: "Tu abogado",
  },
  {
    title: "Tu negocio, listo para crecer",
    benefit: "Reúne lo que tu contador o abogado necesita cuando empiezas a cobrar, contratar o vender al extranjero.",
    deliverable: "Expediente de negocio y pendientes priorizados.",
    gathers: ["Cuándo empiezas a cobrar o contratar", "Clientes o ventas fuera de México", "Pendientes ordenados por prioridad"],
    reviewer: "Tu contador y tu abogado",
  },
];

function TopicDetail({ t }: { t: (typeof TOPICS)[number] }) {
  return (
    <div className="panel-enter rounded-xl bg-card p-6 text-foreground sm:p-8">
      <p className="text-sm font-semibold text-muted-foreground">Entregable</p>
      <p className="mt-1 font-serif text-[26px] leading-tight tracking-[-0.02em]">{t.deliverable}</p>
      <p className="mt-6 text-sm font-semibold text-muted-foreground">Donna te ayuda a reunir</p>
      <ul className="mt-2 space-y-2">
        {t.gathers.map((g) => (
          <li key={g} className="flex gap-3 text-[15px]"><Check aria-hidden className="mt-1 size-4 shrink-0 text-primary" />{g}</li>
        ))}
      </ul>
      <p className="mt-6 border-t border-border pt-4 text-[15px]"><span className="font-semibold">Lo revisa:</span> {t.reviewer}</p>
    </div>
  );
}

export function Topics() {
  const [sel, setSel] = useState(0);
  return (
    <section id="temas" aria-labelledby="h-temas" className="bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-20 lg:grid-cols-12 lg:gap-12 lg:py-24">
        <div className="lg:col-span-7">
          <h2 id="h-temas" className="text-section">Deja que Donna te asista en…</h2>
          <ol className="mt-10 border-t border-primary-foreground/40">
            {TOPICS.map((t, i) => (
              <li key={t.title} className="border-b border-primary-foreground/40">
                <button
                  aria-expanded={sel === i}
                  aria-controls={`tema-${i}`}
                  onClick={() => setSel(i)}
                  className={cn("on-primary-focus grid w-full grid-cols-[2.5rem_1fr_auto] items-start gap-x-2 py-5 lg:px-3 text-left transition-colors", sel === i ? "lg:bg-primary-pressed" : "hover:bg-primary-hover")}
                >
                  <span aria-hidden className="font-serif text-xl">{String(i + 1).padStart(2, "0")}</span>
                  <span>
                    <span className={cn("block font-serif text-[22px] leading-tight tracking-[-0.015em] sm:text-[26px]", sel === i && "underline decoration-1 underline-offset-[6px]")}>{t.title}</span>
                    <span className="mt-2 block text-[15px] text-primary-foreground/90">{t.benefit}</span>
                  </span>
                  <ChevronDown aria-hidden className={cn("mt-1.5 size-5 shrink-0 lg:hidden", sel === i && "rotate-180")} />
                  <ChevronRight aria-hidden className={cn("mt-1.5 hidden size-5 shrink-0 lg:block", sel !== i && "opacity-60")} />
                </button>
                {sel === i && <div id={`tema-${i}`} className="pb-6 lg:hidden"><TopicDetail t={t} /></div>}
              </li>
            ))}
          </ol>
        </div>
        <div className="hidden lg:col-span-5 lg:block lg:pt-[6.5rem]">
          <div className="sticky top-24" aria-live="polite"><TopicDetail key={sel} t={TOPICS[sel]!} /></div>
        </div>
      </div>
    </section>
  );
}

export function Professionals() {
  const els = [
    ["Contexto del negocio", "Qué construyes, cómo cobras y con quién trabajas."],
    ["Documentos organizados", "Cada archivo con su propósito y lo que respalda."],
    ["Preguntas concretas", "Lo que falta aclarar, listo para resolverse en la reunión."],
  ];
  const rows = [
    { icon: Check, k: "Qué sabemos", v: "El producto está en piloto con comercios locales.", src: "Fuente: pitch, diapositiva 4" },
    { icon: CircleHelp, k: "Qué falta", v: "¿Los comercios del piloto ya pagan?", src: "Fuente: tu respuesta" },
    { icon: Scale, k: "Qué revisar", v: "Qué implica empezar a cobrar el producto.", src: `Fuente: ${PENDING_SOURCE.toLowerCase()}` },
  ];
  return (
    <section aria-labelledby="h-pro" className="bg-ink text-on-ink">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 lg:grid-cols-12 lg:py-28">
        <div className="lg:col-span-6">
          <h2 id="h-pro" className="text-section">Tu contador necesita contexto. <span className="text-on-ink-accent">Tu abogado también.</span></h2>
          <p className="mt-6 max-w-lg text-[17px] text-on-ink/85">
            Donna organiza lo que construyes, cómo operas y qué falta aclarar, para que ellos dediquen la reunión a revisar decisiones.
          </p>
          <ul className="mt-10 space-y-6">
            {els.map(([t, d]) => (
              <li key={t} className="border-l-2 border-on-ink-accent pl-5">
                <h3 className="font-serif text-[22px] tracking-[-0.015em]">{t}</h3>
                <p className="mt-1 text-[15px] text-on-ink/80">{d}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="lg:col-span-5 lg:col-start-8 lg:self-center">
          <div className="rounded-xl bg-card text-foreground">
            <p className="border-b border-border px-6 py-4 font-serif text-xl">Qué sabemos. Qué falta. Qué revisar.</p>
            <ol className="divide-y divide-border">
              {rows.map((r) => (
                <li key={r.k} className="flex gap-4 px-6 py-5">
                  <r.icon aria-hidden className="mt-1 size-5 shrink-0 text-primary" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-muted-foreground">{r.k}</p>
                    <p className="mt-0.5">{r.v}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{r.src}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}

const FAQS = [
  ["¿Para quién es Donna?", "Para devs, builders, freelancers de software y founders en México que saben construir producto pero no tienen conocimientos fiscales o legales."],
  ["¿Qué información conviene preparar?", "Lo que ya tienes a la mano: la página de tu negocio, tu presentación, cómo cobras y con quién trabajas. Donna te pregunta lo que falte."],
  ["¿Qué recibe mi contador o abogado?", "Un expediente con el contexto del negocio, documentos organizados y preguntas concretas: qué sabemos, qué falta y qué revisar."],
  ["¿Donna reemplaza la revisión profesional?", "No. Donna prepara el trabajo para que la reunión rinda más; las decisiones las tomas tú con tu contador o abogado."],
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="preguntas" aria-labelledby="h-faq" className="mx-auto grid max-w-6xl gap-10 px-5 py-20 lg:grid-cols-12">
      <h2 id="h-faq" className="text-section lg:col-span-4">Preguntas</h2>
      <div className="border-t border-border-strong lg:col-span-8">
        {FAQS.map(([q, a], i) => (
          <div key={q} className="border-b border-border">
            <h3 className="font-sans text-base">
              <button
                id={`faq-b-${i}`}
                aria-expanded={open === i}
                aria-controls={`faq-p-${i}`}
                onClick={() => setOpen(open === i ? null : i)}
                className="flex min-h-14 w-full items-center justify-between gap-4 py-3 text-left text-[17px] font-semibold"
              >
                {q}
                <ChevronDown aria-hidden className={cn("size-5 shrink-0 text-primary transition-transform", open === i && "rotate-180")} />
              </button>
            </h3>
            <div id={`faq-p-${i}`} role="region" aria-labelledby={`faq-b-${i}`} hidden={open !== i} className="max-w-2xl pb-5 text-muted-foreground">{a}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Closing({ onDemo }: { onDemo: () => void }) {
  return (
    <>
      <section aria-labelledby="h-cierre" className="border-t border-border">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-20 lg:grid-cols-12 lg:py-28">
          <div aria-hidden className="hidden h-full w-px bg-copper lg:col-span-1 lg:block" />
          <div className="lg:col-span-10">
            <h2 id="h-cierre" className="text-display max-w-4xl">Tú sigue construyendo. <span className="text-primary">Donna te ayuda a poner lo demás en orden.</span></h2>
            <a href="#recorrido" onClick={onDemo} className={cn(btn.primary, "mt-10")}>Conoce a Donna</a>
            <Button asChild variant="link" className="ml-4 min-h-11"><Link to="/app">Abrir Donna</Link></Button>
          </div>
        </div>
      </section>
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-8 sm:flex-row sm:items-baseline sm:justify-between">
          <p className="font-serif text-2xl">Donna</p>
          <p className="max-w-md text-sm text-muted-foreground">Donna organiza información y prepara el trabajo para revisión de tu contador o abogado.</p>
        </div>
      </footer>
    </>
  );
}
