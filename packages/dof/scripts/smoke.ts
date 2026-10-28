// `npm run dof:smoke` — one real call per function against SIDOF. Not part of `npm test` (it uses the
// network); run it to confirm the API still answers in the shape the client expects.
import { buscar, publicaciones, textoCompleto } from "../src/index.ts";

const today = new Date().toISOString().slice(0, 10);
const ps = await publicaciones(process.argv[2] ?? today);
console.log(`publicaciones(${process.argv[2] ?? today}): ${ps.length}`, ps[0] ? `· ej. ${ps[0].organismo} — ${ps[0].titulo.slice(0, 80)}` : "");
const withText = ps.find((p) => p.tieneTexto && p.titulo);
if (withText) {
  const t = await textoCompleto(withText.codigo);
  console.log(`textoCompleto(${withText.codigo}): ${t.length} chars · «${t.slice(0, 90)}…»`);
  console.log(`enlace: ${withText.enlace}`);
}
const r = await buscar({ palabras: ["hacienda"], desde: process.argv[2] ?? today, hasta: process.argv[2] ?? today });
console.log(`buscar("hacienda"): ${r.resultados.length} resultado(s) · ${r.errores.length} día(s) con error`);
