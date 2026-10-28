// The SIDOF client against a fake fetch that answers with the shape measured on the real API
// (2026-10-28). Titles here are invented; the live check is `npm run dof:smoke`.
import { test } from "node:test";
import assert from "node:assert/strict";
import { buscar, DofError, htmlToText, publicacion, publicaciones, sidofDate, textoCompleto, MAX_DAYS } from "../src/index.ts";

const nota = (codNota: number, titulo: string | undefined, org = "SECRETARIA DE HACIENDA Y CREDITO PUBLICO", fecha = "28-10-2026") => ({
  codNota, fecha, ...(titulo === undefined ? {} : { titulo }), nombreCodOrgaUno: "PODER EJECUTIVO", codOrgaDos: org,
  pagina: 4, existePdf: "S", existeHtml: "S",
});
const day = (over: Record<string, unknown> = {}) => ({
  messageCode: 200, response: "OK", NotasMatutinas: [nota(1, "Decreto por el que se reforma la Ley del Impuesto sobre la Renta"), nota(2, undefined)],
  NotasVespertinas: [nota(3, "Aviso sobre activos virtuales", "UNIDAD DE INTELIGENCIA FINANCIERA")], NotasExtraordinarias: [], ...over,
});
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
const fakeFetch = (routes: Record<string, () => Response>) => (async (url: string | URL | Request) => {
  const path = String(url).replace("https://sidof.segob.gob.mx", "");
  const route = routes[path];
  if (!route) throw new TypeError("network down");
  return route();
}) as typeof fetch;

test("dates go to SIDOF as DD-MM-YYYY, and a bad one is refused", () => {
  assert.equal(sidofDate("2026-10-28"), "28-10-2026");
  assert.throws(() => sidofDate("28/10/2026"), DofError);
});

test("a day's publications come out by edition, with the official link a person opens", async () => {
  const f = fakeFetch({ "/dof/sidof/notas/28-10-2026": () => json(day()) });
  const ps = await publicaciones("2026-10-28", { fetch: f });
  assert.deepEqual(ps.map((p) => [p.codigo, p.edicion]), [[1, "matutina"], [2, "matutina"], [3, "vespertina"]]);
  assert.equal(ps[0].fecha, "2026-10-28");
  assert.equal(ps[0].enlace, "https://dof.gob.mx/nota_detalle.php?codigo=1&fecha=28/10/2026");
  assert.equal(ps[1].titulo, "", "a publication without a title stays empty, never undefined");
  assert.equal(ps[2].organismo, "UNIDAD DE INTELIGENCIA FINANCIERA");
});

test("an HTTP error or an API error is a DofError with its status", async () => {
  await assert.rejects(publicaciones("2026-10-28", { fetch: fakeFetch({ "/dof/sidof/notas/28-10-2026": () => json({}, 503) }) }), { name: "DofError", status: 503 });
  await assert.rejects(publicaciones("2026-10-28", { fetch: fakeFetch({ "/dof/sidof/notas/28-10-2026": () => json({ messageCode: 400, response: "BAD_REQUEST" }) }) }), /SIDOF: BAD_REQUEST/);
  await assert.rejects(publicaciones("2026-10-28", { fetch: fakeFetch({}) }), { status: 0 });
});

test("one publication's record", async () => {
  const f = fakeFetch({ "/dof/sidof/notas/nota/7": () => json({ messageCode: 200, Nota: nota(7, "Acuerdo") }) });
  assert.equal((await publicacion(7, { fetch: f })).titulo, "Acuerdo");
  await assert.rejects(publicacion(-1), /positive integer/);
});

test("full text comes out readable: no scripts, no tags, entities decoded", async () => {
  const html = "<html><head><title>x</title></head><body><script>var a=1</script><p>ARTÍCULO 1.&nbsp;Se reforma&#160;el art&iacute;culo.</p><p>Transitorio &laquo;&uacute;nico&raquo;</p></body></html>";
  const f = fakeFetch({ "/notas/docFuente/9": () => new Response(html.replace("&iacute;", "í").replace("&uacute;", "ú")) });
  assert.equal(await textoCompleto(9, { fetch: f }), "ARTÍCULO 1. Se reforma el artículo.\nTransitorio «único»");
  assert.equal(htmlToText("<style>p{}</style><b>a</b> &amp; b"), "a & b");
});

test("search matches every word, ignoring accents and case, across editions", async () => {
  const f = fakeFetch({ "/dof/sidof/notas/28-10-2026": () => json(day()) });
  const r = await buscar({ palabras: ["impuesto", "RENTA"], desde: "2026-10-28", hasta: "2026-10-28" }, { fetch: f, pauseMs: 0 });
  assert.deepEqual(r.resultados.map((p) => p.codigo), [1]);
  const uif = await buscar({ palabras: ["inteligencia financiera"], desde: "2026-10-28", hasta: "2026-10-28" }, { fetch: f, pauseMs: 0 });
  assert.deepEqual(uif.resultados.map((p) => p.codigo), [3], "the issuing body counts too");
  const mixed = await buscar({ palabras: ["impuesto", "virtuales"], desde: "2026-10-28", hasta: "2026-10-28" }, { fetch: f, pauseMs: 0 });
  assert.deepEqual(mixed.resultados, [], "one word matching is not enough: EVERY word must");
});

test("a day that fails is reported and the search goes on", async () => {
  const f = fakeFetch({ "/dof/sidof/notas/27-10-2026": () => json(day({ NotasMatutinas: [nota(5, "Reforma a la Ley del Impuesto sobre la Renta", undefined, "27-10-2026")], NotasVespertinas: [] })) });
  const r = await buscar({ palabras: ["renta"], desde: "2026-10-27", hasta: "2026-10-28" }, { fetch: f, pauseMs: 0 });
  assert.deepEqual(r.resultados.map((p) => p.codigo), [5]);
  assert.equal(r.errores.length, 1);
  assert.equal(r.errores[0].fecha, "2026-10-28");
  assert.equal(r.dias, 2);
});

test("a search is capped and validated before any request", async () => {
  await assert.rejects(buscar({ palabras: ["x"], desde: "2026-01-01", hasta: "2026-03-01" }), new RegExp(`at most ${MAX_DAYS} days`));
  await assert.rejects(buscar({ palabras: ["x"], desde: "2026-10-28", hasta: "2026-10-27" }), /on or before/);
  await assert.rejects(buscar({ palabras: [" "], desde: "2026-10-28", hasta: "2026-10-28" }), /at least one word/);
});
