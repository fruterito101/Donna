# @dona/reader — por crear

La capa **LEER**: dada la URL de una landing (y el PDF del pitch), devuelve su texto limpio con la
fecha de lectura. Dueño: **Artur**.

- Entrada: URL de la landing · archivo PDF del pitch.
- Salida: `ReadResult` (`docs/CONTRATOS.md` §4).
- Usa **Firecrawl** (reto del evento; créditos gratis) con `FIRECRAWL_API_KEY` — solo servidor.
- También lee 1-2 páginas oficiales (SAT, DOF) para fechar las reglas.

Al crearlo: agrega aquí su `package.json` como `@dona/reader`, súmalo a `transpilePackages` en
`apps/web/next.config.ts` y actualiza `docs/ESTADO.md`.
