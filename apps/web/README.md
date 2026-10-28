# apps/web — la app de Dona

Next.js 16.4 + React 19 + Tailwind 4. Frontend (páginas) y backend (rutas `src/app/api/*`).

- Arrancar, variables y reglas: el `README.md` y el `AGENTS.md` de la raíz.
- ⚠️ Esta versión de Next cambia APIs: lee `AGENTS.md` de esta carpeta y la documentación local en
  `node_modules/next/dist/docs/` antes de escribir código.
- `src/app/api/chat/route.ts` — el backend que habla con el agente (dueño: Brian).
- `src/app/page.tsx` + `chat-test.tsx` — página **de prueba** del chat; Artur la reemplaza con el
  producto.
