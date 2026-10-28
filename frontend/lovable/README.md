<!-- Cómo ejecutar y verificar el frontend de Donna importado de Lovable. -->
# Donna — frontend de Lovable

Landing en `/`, espacio de trabajo en `/app` y tablero en `/operaciones`, exportados del proyecto [Donna en Lovable](https://lovable.dev/projects/e0566eea-0cd2-4aa7-a2dc-78ffb4b922c8).

Esta carpeta es un proyecto independiente con TanStack Start, React, TypeScript y Tailwind. Está fuera de los workspaces npm del monorepo para conservar intactos `apps/web`, su backend y su instalación.

## Ejecutar

Requiere Node.js 22.23 o superior y Bun 1.3.9 o compatible con el lockfile incluido.

```sh
cd frontend/lovable
bun install --frozen-lockfile
bun run dev --host 127.0.0.1 --port 5173
```

Abrir [la landing](http://localhost:5173/) o [la app](http://localhost:5173/app). No se necesitan llaves para esta interfaz. El archivo `bun.lock` fija las dependencias exportadas; no es necesario reinstalar las dependencias del monorepo para usarla.

## Verificar

```sh
bun run test
bun x tsc --noEmit
bun run build
```

El build mantiene la configuración original de Lovable y genera `.output/` para Cloudflare/Nitro. `bun run preview` permite revisar el resultado. Estos comandos no publican ni modifican el despliegue Next.js del repositorio.

## Alcance

- La landing conserva la comparación, los temas y el recorrido automático.
- La app tiene conversación con Donna, perfil editable, expediente, adjuntos locales y resumen copiable/descargable.
- «Contactar a un Profesional» abre admisión con una ficha de ejemplo válida y editable; «Comenzar conversación» inicia Donna por texto; `/operaciones` muestra los prospectos registrados en esta sesión.
- Los datos viven en memoria durante la sesión. Los archivos solo aportan metadatos; no se analizan ni se suben.
- El chat y la admisión llaman al backend existente mediante `/api/donna/chat`, un proxy del servidor con identidad por cookie. `DONNA_BACKEND_ORIGIN` es opcional y solo de servidor; su valor por defecto es `https://donna-mx.vercel.app`. No se necesitan claves del agente en esta carpeta.
- ElevenLabs, autenticación de operadores, almacenamiento compartido y entrega al despacho siguen pendientes. No se procesan documentos ni se decide qué ley aplica desde el chat. Ver `INTAKE_INTEGRATION.md`.
- `PRODUCT.md`, `DESIGN.md`, `LANDING_BRIEF.md` y `APP_BRIEF.md` documentan la experiencia exportada.
- Esta es una importación puntual; no establece sincronización automática GitHub–Lovable.

## Procedencia

Proyecto Lovable: `e0566eea-0cd2-4aa7-a2dc-78ffb4b922c8`.
Commit fuente: `724720a07196bccaf21d3ac746a28bc2fbe381ad`.
Fecha de exportación: 2026-10-28.

Se importaron los 120 archivos de texto expuestos por el conector. El único binario, el favicon genérico, se devuelve como texto con pérdida de bytes y no puede recuperarse fielmente mediante ese conector: se sustituyó por `public/favicon.svg`, con el monograma de Donna, y se actualizó su referencia. Este README adapta las instrucciones a la ubicación del repositorio. No se importan secretos, dependencias instaladas ni artefactos de build.

El resto del código y el lockfile se conservan desde el commit fuente, incluidos los componentes que entrega el scaffold de Lovable. `.lovable/project.json` registra la plantilla de origen; por sí solo no vincula esta carpeta a una sincronización. `IMPORT.json` registra el proyecto, el commit y los hashes de los archivos originales.
