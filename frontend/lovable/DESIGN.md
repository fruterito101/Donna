---
name: Donna
description: Editorial cálido, preciso y poderoso. La claridad se demuestra en un expediente que se ordena ante ti.
colors:
  primary: "#8C382E"
  primary-hover: "#752C24"
  primary-pressed: "#60231D"
  on-primary: "#FFFFFF"
  ink: "#211B19"
  copper: "#AF7150"
  background: "#F8F4EE"
  surface: "#FFFDFA"
  subtle: "#F0E9E0"
  selected: "#F5E4DD"
  text-muted: "#6D6059"
  border-decorative: "#D8CCC1"
  border-functional: "#8B7B70"
  dark-accent: "#E9AA8E"
  success: "#35634D"
  success-container: "#EAF2EC"
  error: "#A12D3A"
  error-container: "#FAEDEF"
typography:
  display:
    fontFamily: Georgia, serif
    fontWeight: 400
    fontSize: 64px
    fontSizeMobile: 40px
    letterSpacing: -0.03em
  section-title:
    fontFamily: Georgia, serif
    fontWeight: 400
    fontSize: 40px
  body:
    fontFamily: Inter, system-ui, sans-serif
    fontWeight: 400
    fontSize: 16px
    lineHeight: 1.6
  label:
    fontFamily: Inter, system-ui, sans-serif
    fontWeight: 600
rounded:
  control: 8px
  card: 12px
  panel: 16px
spacing:
  tap-target: 44px
  focus-ring: 2px
  focus-offset: 3px
motion:
  panel-change: 180ms ease-out
  reduced-motion: none
---

# Reglas
- Cobre solo decorativo; nunca texto pequeño. Tracking nunca menor a -0.035em.
- Sin degradados, glass, ruido, texto en gradiente, eyebrows, píldoras gigantes, grids de tarjetas idénticas, imágenes de stock ni retratos. Excepción única, solicitada explícitamente por el usuario: la sección "Así trabaja Donna" lleva fondo full-width con degradado lineal de #8C382E a #60231D (135deg). Nunca texto en gradiente ni brillos; el contenido se mantiene centrado con max-width.
- Sección "Así trabaja Donna": título en blanco (#FFFFFF) y apoyo en #F5E4DD sobre el degradado (contraste verificado ≥ 6.2:1 en ambos extremos); conversación y expediente conservan sus superficies claras.
- Controles del recorrido retirados (a petición del usuario): sin botones Pausar/Reanudar ni Repetir. La reproducción se pausa mientras el foco de teclado está dentro del módulo (se reanuda al salir, sin perder la pausa manual de elegir un paso).
- El producto en funcionamiento (conversación + documento) es la pieza visual.
- Masas de color con intención: portada marfil, una región auburn (#8C382E, texto blanco) para temas, una región tinta (#211B19, texto marfil) para el valor a profesionales. Foco blanco sobre auburn, #E9AA8E sobre tinta.
- Transiciones breves (180 ms) solo en el recorrido automático y el detalle de temas; nada con reduced motion.
- Sin badges ni avisos repetidos de "ejemplo".
- Iconos Lucide.

## App — modo Operate
- /app tiene su propia shell sin navegación ni pie de marketing. Sidebar de 232 px en superficie subtle, lienzo marfil y expediente claro de 360 px a partir de 1200 px.
- Inter 16 px en conversación y formularios; Georgia reservada a marca y bienvenida. Tipografía de app sin tracking negativo. Auburn para acción principal y selección; sin degradados en el espacio de trabajo.
- Altura de viewport, scroll independiente para conversación, vistas y expediente; composer en flujo, nunca encima de mensajes.
- Entre 768 y 1199 px expediente desplegable; móvil navegación en drawer y expediente independiente. Diálogos con Escape y retorno de foco. Controles de al menos 44 px y foco auburn visible.
- Estados vacíos útiles, hechos separados de pendientes, superficies sobrias sin tarjetas anidadas ni métricas decorativas.
- Captación: CTA auburn con Phone cerca del pie de sidebar, también móvil. Ficha editable sans con revisión exacta, autorización sin preselección y voz deshabilitada; sin waveform activo ni simulación de llamada.
- Operaciones: encabezados sans sobrios, tabla semántica de cinco columnas y scroll horizontal contenido en región etiquetada; detalle en panel con Escape/foco de retorno. Ninguna métrica no derivada de registros reales de sesión.
