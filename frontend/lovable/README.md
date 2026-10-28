<!-- Cómo ejecutar y verificar el frontend de Donna importado de Lovable. -->
# Donna — frontend de Lovable

Landing en `/`, espacio de trabajo en `/app` y tablero en `/professional-contact` (también disponible en `/operaciones`), exportados del proyecto [Donna en Lovable](https://lovable.dev/projects/e0566eea-0cd2-4aa7-a2dc-78ffb4b922c8).

El código visual conserva TanStack Start, React, TypeScript y Tailwind. Ahora forma parte del workspace npm como `@donna/frontend`: una instalación en la raíz fija también sus dependencias en `package-lock.json`.

## Ejecutar

Requiere Node.js 22.18 o superior y npm. Desde la raíz:

```sh
npm ci
npm run dev
```

Next construye las páginas públicas y las sirve en `http://localhost:3000`, junto con las APIs. Para iterar solo la interfaz con recarga automática:

```sh
npm run dev -w @donna/frontend -- --host 127.0.0.1 --port 5173
```

Ese modo independiente conserva su proxy al backend existente. No se necesitan llaves del agente en esta carpeta. El `bun.lock` se conserva como parte de la exportación de origen; el lockfile reproducible del despliegue unificado es el de npm en la raíz.

## Verificar

Desde la raíz:

```sh
npm run test:frontend
npx tsc --noEmit -p frontend/lovable/tsconfig.json
npm run build
npm run test:domain
```

`npm run build` genera HTML de `/`, `/app`, `/professional-contact` y `/operaciones` con `DONNA_BUILD_TARGET=next`; copia únicamente documentos, favicon y recursos cliente a `apps/web/public/donna` (ignorado por Git). Next los publica mediante rewrites explícitos. La landing llega con HTML completo; las transiciones internas conservan la sesión TanStack.

`npm run build -w @donna/frontend` conserva el build independiente original con Nitro. No modifica el despliegue público por sí solo.

## Alcance

- La landing conserva la comparación, los temas y el recorrido automático.
- La app tiene conversación con Donna, perfil editable, expediente, adjuntos locales y resumen copiable/descargable.
- «Contactar a un Profesional» abre una simulación visual de llamada. «Continuar por texto» abre la admisión con ficha de ejemplo válida y editable; «Comenzar conversación» inicia Donna por texto; `/operaciones` muestra los prospectos registrados en esta sesión.
- Los datos viven en memoria durante la sesión. Los archivos solo aportan metadatos; no se analizan ni se suben.
- En Next, chat y admisión llaman a `/api/donna/chat`, que valida la petición y ejecuta el handler existente de `/api/chat` en el mismo contexto de visitante. En el modo independiente, esa ruta usa el proxy del servidor con identidad por cookie. `DONNA_BACKEND_ORIGIN` es opcional y solo de servidor; su valor por defecto es `https://donna-mx.vercel.app`. No se necesitan claves del agente en esta carpeta.
- ElevenLabs, autenticación de operadores, almacenamiento compartido y entrega al despacho siguen pendientes. No se procesan documentos ni se decide qué ley aplica desde el chat. Ver `INTAKE_INTEGRATION.md`.
- `PRODUCT.md`, `DESIGN.md`, `LANDING_BRIEF.md` y `APP_BRIEF.md` documentan la experiencia exportada.
- Esta es una importación puntual; no establece sincronización automática GitHub–Lovable.

## Procedencia

Proyecto Lovable: `e0566eea-0cd2-4aa7-a2dc-78ffb4b922c8`.
Commit fuente: `6e96d3afbbd3764e6249276a7c0d27f600fa26a5`.
Fecha de exportación: 2026-10-28.

Se importaron los 122 archivos de texto expuestos por el conector. El único binario, el favicon genérico, se devuelve como texto con pérdida de bytes y no puede recuperarse fielmente mediante ese conector: se sustituyó por `public/favicon.svg`, con el monograma de Donna, y se actualizó su referencia. Este README adapta las instrucciones a la ubicación del repositorio. No se importan secretos, dependencias instaladas ni artefactos de build.

El resto del código y el lockfile se conservan desde el commit fuente, incluidos los componentes que entrega el scaffold de Lovable. `.lovable/project.json` registra la plantilla de origen; por sí solo no vincula esta carpeta a una sincronización. `IMPORT.json` registra el proyecto, el commit y los hashes de los archivos originales.

## Adaptación del despliegue

La integración Next añade prerender controlado, una ruta de contacto profesional y validación compartida. Los hashes de `IMPORT.json` describen los archivos originales exportados; no certifican estas adaptaciones locales. El backend y las claves de servidor siguen en `apps/web`.
