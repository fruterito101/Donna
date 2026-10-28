// Mexico's Diario Oficial de la Federación (DOF), read through SIDOF — the official API of the
// Secretaría de Gobernación. dof.gob.mx's robots.txt disallows robots on its note pages, so Donna
// never scrapes the site: every call goes to the API, gently (one request at a time, a pause between
// days). What Donna cites is the official link to dof.gob.mx, for a person to open.
// Nothing here decides the law: a publication is official but unreviewed by the team.

const API = "https://sidof.segob.gob.mx";
const TIMEOUT_MS = 20_000;
/** A search walks day by day: this caps how far one search can reach, to stay a polite client. */
export const MAX_DAYS = 31;

export type Edicion = "matutina" | "vespertina" | "extraordinaria";

export type Publicacion = {
  codigo: number;
  fecha: string; // YYYY-MM-DD
  edicion?: Edicion;
  poder: string; // e.g. PODER EJECUTIVO
  organismo: string; // e.g. SECRETARIA DE HACIENDA Y CREDITO PUBLICO
  titulo: string; // "" when SIDOF has none (it happens: section headers)
  pagina: number | null;
  tienePdf: boolean;
  tieneTexto: boolean;
  /** the page a person opens on dof.gob.mx — what Donna cites */
  enlace: string;
};

export class DofError extends Error {
  readonly status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "DofError";
    this.status = status;
  }
}

export type Options = { fetch?: typeof fetch; pauseMs?: number };

const plain = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** Date | YYYY-MM-DD → the DD-MM-YYYY SIDOF expects. */
export function sidofDate(d: Date | string): string {
  const iso = typeof d === "string" ? d : d.toISOString().slice(0, 10);
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) throw new DofError(`date must be YYYY-MM-DD, got '${iso}'`, 400);
  return `${m[3]}-${m[2]}-${m[1]}`;
}

const toIso = (ddmmyyyy: string) => {
  const [d, m, y] = ddmmyyyy.split("-");
  return `${y}-${m}-${d}`;
};

type RawNota = {
  codNota: number; fecha: string; titulo?: string; nombreCodOrgaUno?: string; codOrgaDos?: string;
  pagina?: number | null; existePdf?: string; existeHtml?: string;
};

function normalize(n: RawNota, edicion?: Edicion): Publicacion {
  const [d, m, y] = n.fecha.split("-");
  return {
    codigo: n.codNota,
    fecha: toIso(n.fecha),
    ...(edicion ? { edicion } : {}),
    poder: (n.nombreCodOrgaUno ?? "").trim(),
    organismo: (n.codOrgaDos ?? "").trim(),
    titulo: (n.titulo ?? "").trim(),
    pagina: typeof n.pagina === "number" ? n.pagina : null,
    tienePdf: n.existePdf === "S",
    tieneTexto: n.existeHtml === "S",
    enlace: `https://dof.gob.mx/nota_detalle.php?codigo=${n.codNota}&fecha=${d}/${m}/${y}`,
  };
}

async function get(path: string, f: typeof fetch): Promise<Response> {
  let res: Response;
  try {
    res = await f(`${API}${path}`, { signal: AbortSignal.timeout(TIMEOUT_MS) } /* no Accept header: SIDOF answers 406 to a specific one (measured) */);
  } catch (e) {
    throw new DofError(`SIDOF unreachable (${(e as Error).name})`, 0);
  }
  if (!res.ok) throw new DofError(`SIDOF answered HTTP ${res.status}`, res.status);
  return res;
}

/** Every publication of one day, by edition. */
export async function publicaciones(fecha: Date | string, { fetch: f = fetch }: Options = {}): Promise<Publicacion[]> {
  const data = (await (await get(`/dof/sidof/notas/${sidofDate(fecha)}`, f)).json()) as Record<string, unknown>;
  if (data.messageCode !== 200) throw new DofError(`SIDOF: ${String(data.response)}`, Number(data.messageCode) || 502);
  const editions: [string, Edicion][] = [["NotasMatutinas", "matutina"], ["NotasVespertinas", "vespertina"], ["NotasExtraordinarias", "extraordinaria"]];
  return editions.flatMap(([key, ed]) => ((data[key] as RawNota[] | undefined) ?? []).map((n) => normalize(n, ed)));
}

/** One publication's record. */
export async function publicacion(codigo: number, { fetch: f = fetch }: Options = {}): Promise<Publicacion> {
  if (!Number.isInteger(codigo) || codigo <= 0) throw new DofError("codigo must be a positive integer", 400);
  const data = (await (await get(`/dof/sidof/notas/nota/${codigo}`, f)).json()) as { messageCode?: number; Nota?: RawNota; response?: string };
  if (data.messageCode !== 200 || !data.Nota) throw new DofError(`SIDOF: ${String(data.response)}`, Number(data.messageCode) || 404);
  return normalize(data.Nota);
}

/** HTML → readable text: scripts, styles and tags out, entities decoded, blank runs collapsed. */
export function htmlToText(html: string): string {
  const named: Record<string, string> = { nbsp: " ", amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", ndash: "–", mdash: "—", laquo: "«", raquo: "»" };
  return html
    .replace(/<(script|style|head)\b[\s\S]*?<\/\1>/gi, " ")
    .replace(/<br\s*\/?>|<\/(p|div|tr|li|h\d)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&([a-z]+);/gi, (m, n) => named[n.toLowerCase()] ?? m)
    .replace(/[ \t ]+/g, " ")
    .replace(/\s*\n\s*/g, "\n")
    .trim();
}

/** A publication's full text, as published. */
export async function textoCompleto(codigo: number, { fetch: f = fetch }: Options = {}): Promise<string> {
  if (!Number.isInteger(codigo) || codigo <= 0) throw new DofError("codigo must be a positive integer", 400);
  const text = htmlToText(await (await get(`/notas/docFuente/${codigo}`, f)).text());
  if (!text) throw new DofError("SIDOF returned no text for this publication", 404);
  return text;
}

export type Busqueda = {
  resultados: Publicacion[];
  /** days that could not be read: reported, never thrown — the rest of the search still counts */
  errores: { fecha: string; motivo: string }[];
  dias: number;
};

/**
 * Publications between two dates (inclusive) whose title or issuing body contains EVERY word,
 * ignoring accents and case. Walks day by day with a pause: SIDOF has no search we have measured.
 */
export async function buscar(
  { palabras, desde, hasta }: { palabras: string[]; desde: string; hasta: string },
  { fetch: f = fetch, pauseMs = 250 }: Options = {},
): Promise<Busqueda> {
  const words = palabras.map((w) => plain(w).trim()).filter(Boolean);
  if (!words.length) throw new DofError("palabras needs at least one word", 400);
  sidofDate(desde);
  sidofDate(hasta);
  const start = new Date(`${desde}T00:00:00Z`);
  const end = new Date(`${hasta}T00:00:00Z`);
  const dias = Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1;
  if (dias < 1) throw new DofError("desde must be on or before hasta", 400);
  if (dias > MAX_DAYS) throw new DofError(`a search reaches at most ${MAX_DAYS} days, got ${dias}`, 400);

  const out: Busqueda = { resultados: [], errores: [], dias };
  for (let i = 0; i < dias; i++) {
    const day = new Date(start.getTime() + i * 86_400_000).toISOString().slice(0, 10);
    try {
      for (const p of await publicaciones(day, { fetch: f })) {
        const hay = plain(`${p.titulo} ${p.organismo}`);
        if (words.every((w) => hay.includes(w))) out.resultados.push(p);
      }
    } catch (e) {
      out.errores.push({ fecha: day, motivo: (e as Error).message });
    }
    if (i < dias - 1 && pauseMs > 0) await new Promise((r) => setTimeout(r, pauseMs));
  }
  return out;
}
