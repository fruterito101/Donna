# @donna/dof

Lee el **Diario Oficial de la Federación** por la **API oficial de SIDOF** (Secretaría de Gobernación). Dueño: Brian.

## Por qué la API y no el sitio

`dof.gob.mx/robots.txt` prohíbe a los robots leer las páginas de cada nota (`Disallow: /nota_detalle.php?`), y su
buscador es un buscador de Google incrustado. SIDOF (`sidof.segob.gob.mx`) entrega lo mismo en JSON. Donna **no
lee el sitio**: consulta la API, de a una petición, con pausa entre días, y **cita el enlace oficial** de dof.gob.mx
para que una persona lo abra.

## Qué hace

| Función | Qué devuelve | Endpoint de SIDOF |
|---|---|---|
| `publicaciones(fecha)` | todas las publicaciones de un día, por edición (matutina · vespertina · extraordinaria) | `/dof/sidof/notas/DD-MM-YYYY` |
| `publicacion(codigo)` | la ficha de una publicación | `/dof/sidof/notas/nota/<codigo>` |
| `textoCompleto(codigo)` | su texto íntegro, sin HTML | `/notas/docFuente/<codigo>` |
| `buscar({ palabras, desde, hasta })` | las publicaciones cuyo título u organismo contiene **todas** las palabras (sin acentos ni mayúsculas); máximo 31 días; un día que falla va a `errores`, no detiene la búsqueda | recorre `publicaciones` día por día |

Cada `Publicacion` trae `codigo`, `fecha`, `edicion`, `poder`, `organismo`, `titulo` (vacío si SIDOF no trae),
`pagina`, `tienePdf`, `tieneTexto` y `enlace` (la página oficial que se cita).

## ⚠️ Lo que NO es

Una publicación del DOF es **oficial, pero no está revisada por el equipo**: no es una regla de `rules/` ni decide
qué te aplica. Quien la use (el agente, el vigilante de reglas) la presenta con su fecha y su enlace, y marca
«publicación oficial, no revisada».

## Probar

- `npm test` — con un `fetch` simulado que responde con la forma medida en SIDOF.
- `npm run dof:smoke -- 2026-10-28` — **contra la API real**: publicaciones del día, un texto completo y una
  búsqueda. Usa la red; no corre en `npm test`.

⬜ Sin medir: si SIDOF tiene búsqueda propia por palabra, sus términos de uso y su límite de peticiones.
