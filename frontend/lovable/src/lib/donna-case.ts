// Caso "Nube Clara" del recorrido del producto. No constituye asesoría fiscal.

export type Stage = "clientes" | "desarrollo" | "incierto";

export const STAGE_OPTIONS: { value: Stage; label: string }[] = [
  { value: "clientes", label: "Ya tengo clientes" },
  { value: "desarrollo", label: "Sigo desarrollando" },
  { value: "incierto", label: "No estoy seguro" },
];

export const STAGE_SUMMARY: Record<Stage, string> = {
  clientes: "Nube Clara indica que ya tiene clientes.",
  desarrollo: "Nube Clara indica que sigue desarrollando el producto.",
  incierto: "Nube Clara aún no sabe si cuenta como negocio con clientes.",
};

export const PENDING_SOURCE = "Fuente pendiente de verificación";

export interface CaseView {
  confirmed: string[];
  pending: string[];
  review: string[];
}

export function getCaseView(stage: Stage | null): CaseView {
  const confirmed = [
    "Desarrolla software con inteligencia artificial para pequeños comercios.",
    "Equipo de cuatro personas, operando desde México.",
  ];
  const pending = ["Si hay clientes en el extranjero y cómo se les cobra."];
  const review = [
    "Cómo documentar el desarrollo del producto para que tu contador evalúe posibles beneficios.",
  ];

  if (stage === null) {
    pending.unshift("Etapa del negocio: falta responder en el paso Confirma.");
  } else {
    if (stage !== "incierto") confirmed.push(STAGE_SUMMARY[stage]);
    if (stage === "clientes") {
      pending.unshift("Desde cuándo hay ingresos y a quién se le factura.");
      review.push("Qué implica para Nube Clara tener ingresos recurrentes.");
    }
    if (stage === "desarrollo") {
      pending.unshift("Fecha estimada de los primeros ingresos.");
    }
    if (stage === "incierto") {
      pending.unshift("Si ya hay clientes, pilotos pagados o solo pruebas gratuitas.");
    }
  }
  return { confirmed, pending, review };
}

export const CHECKLIST = [
  {
    id: "resumen",
    title: "Resumen del negocio en una página",
    detail: "Qué vende Nube Clara, a quién y desde cuándo. Tomado del pitch y la página.",
  },
  {
    id: "desarrollo",
    title: "Bitácora del desarrollo del producto",
    detail: "Objetivos, avances y evidencia (versiones, pruebas, decisiones técnicas) ordenados por fecha.",
  },
  {
    id: "preguntas",
    title: "Preguntas abiertas para tu contador",
    detail: "Lo que falta confirmar, escrito en lenguaje claro para que la revisión sea rápida.",
  },
];

export function buildReportText(stage: Stage | null): string {
  const v = getCaseView(stage);
  const list = (items: string[]) => items.map((i) => `- ${i}`).join("\n");
  return [
    "DONNA · GUÍA DE TRABAJO — PARA REVISIÓN PROFESIONAL",
    "Caso: Nube Clara",
    "",
    "Organiza información para que la revise un contador o abogado. No es un dictamen.",
    "",
    "DATOS CONFIRMADOS",
    list(v.confirmed),
    "",
    "PREGUNTAS PENDIENTES",
    list(v.pending),
    "",
    "PARA REVISIÓN PROFESIONAL",
    list(v.review),
    "",
    "OPORTUNIDAD POR EXPLORAR",
    "Documentar el desarrollo del producto.",
    "Organiza objetivos, avances y evidencia para que tu contador evalúe posibles beneficios.",
    `Fuente: ${PENDING_SOURCE}.`,
    "",
    "INFORMACIÓN PARA COMPARTIR",
    list(CHECKLIST.map((c) => `${c.title}: ${c.detail}`)),
  ].join("\n");
}
