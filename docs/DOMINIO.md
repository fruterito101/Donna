<!-- Propuesta de distribución de las superficies de Donna en el dominio existente. -->
# Dominio de Donna — distribución aprobada

Fecha: 2026-10-28.

## Intención

Artur pidió reutilizar el dominio ya asignado al repositorio: `https://donna-mx.vercel.app`. La landing, la app y el centro de contacto deben tener accesos diferenciados conservando el agente y la identidad de cada visitante.

## Distribución aprobada

| URL pública | Superficie |
|---|---|
| `/` | Landing importada de Lovable |
| `/app` | Espacio de trabajo de la persona usuaria |
| `/professional-contact` | Centro operativo de contacto profesional |
| `/operaciones` | Acceso compatible a la misma vista operativa |
| `/api/chat` y `/api/report` | Backend actual de Next, conservado |

La admisión de la persona usuaria permanece en el flujo «Contactar a un Profesional» de `/app`; el centro operativo es otra superficie. La URL no sustituye autenticación ni convierte los registros de sesión en almacenamiento compartido.

## Alternativas

1. **Reutilizar el dominio mediante rutas**, propuesto para cumplir la indicación de Artur sin registrar otro dominio. Requiere integrar el frontend importado con el despliegue existente.
2. **Usar un dominio propio y subdominios** para landing, app y operaciones. Permite la estructura de hosts planteada inicialmente, pero requiere propiedad y configuración DNS que no están disponibles en este repositorio.

No se asume que los subdominios anidados de un dominio asignado por la plataforma estén disponibles.

## Estado comprobado

El despliegue documentado de Vercel usa la rama `main` y la raíz `apps/web`. La interfaz importada está en `frontend/lovable`, utiliza TanStack Start y se construye por separado. Cambiar enlaces, títulos o metadatos no hace que Vercel publique esa interfaz en el dominio del backend.

## Trabajo para implementar después de aprobar la distribución

- Definir cómo servir el frontend importado dentro del despliegue Vercel conservando los endpoints Next y sus credenciales de servidor.
- Ajustar navegación, ruta operativa y direcciones canónicas.
- Verificar `/`, `/app`, `/professional-contact`, compatibilidad de `/operaciones`, recursos estáticos y cookies.
- Publicar mediante rama/PR y comprobar las URLs del despliegue.

No se ha cambiado el dominio, publicado una versión ni alterado el backend como parte de esta propuesta.

## Implementación

Aprobada por Artur en esta conversación el 28 de octubre de 2026. El build genera las cuatro páginas con TanStack Start y copia únicamente HTML y recursos cliente a `apps/web/public/donna`. Los rewrites de Next sirven esas rutas; los endpoints Next permanecen activos.

El frontend conserva su código y navegación. `/api/donna/chat` valida origen, tipo, tamaño y estructura del cuerpo, y delega al handler Next original en el mismo contexto de cookies. No existe un proxy HTTP del despliegue hacia sí mismo. El alias hereda el presupuesto de espera del agente existente, sin el corte de 25 segundos del proxy independiente.

La instalación reproducible es `npm ci` desde la raíz. Vercel conserva la raíz `apps/web` y su build npm; no se requieren variables del agente en el frontend ni cambios de dominio/DNS. El cambio público depende del merge y despliegue de la rama.
