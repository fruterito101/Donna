# Dona — definición del proyecto (Hacktoberfest México 2026)

Borrador para que el equipo lo lea, lo discuta y diga «de acuerdo» o «cambia esto».
Fecha: 2026-10-27 · demo: 2026-10-28 17:00, Sandbox Hub.

## 1 · Qué es Dona

> **Dona lee tu startup y te dice qué te exige la ley mexicana, qué beneficios estás dejando ir y
> qué documentar — con la fuente oficial de cada cosa — y te lo deja listo para tu contador o abogado.**

Es una asesora de cumplimiento para quien construye tecnología en México. No reemplaza al
profesional: hace el 80% previo para que el profesional trabaje rápido y el founder llegue informado.

## 2 · Qué puede y qué no puede

| Dona SÍ | Dona NO |
|---|---|
| Leer tu landing y tu pitch y entender qué haces, cómo cobras y a quién | Firmar una opinión fiscal o legal |
| Mapear obligaciones: SAT · IMSS · UIF/GAFI · datos personales · propiedad intelectual | Decir que «tienes derecho» a un beneficio |
| Señalar beneficios posibles (ej. estímulo a I+D) **con sus condiciones** | Inventar una regla: si no la tiene, lo dice |
| Decir qué evidencia guardar y qué falta | Hacer trámites ante el SAT, IMSS o UIF por ti |
| Explicarlo en voz y responder preguntas | Hablar de otros clientes o de su infraestructura |
| Entregar un expediente para tu contador/abogado, un archivo de políticas para tu repo y tu pitch corregido | Garantizar que la norma no cambió después de su fecha de vigencia |

## 3 · Para quién (mercado)

| Segmento | Su dolor | Por qué pagaría |
|---|---|---|
| Dev freelance que cobra al extranjero | no sabe qué régimen, qué facturar, qué guardar | evitar multas; ordenar su situación |
| Founder técnico de SaaS / IA | no sabe qué le exige la ley ni qué incentivos pierde | estímulos a I+D; llegar listo a inversionistas |
| Fintech y cripto | riesgo de ser «actividad vulnerable» ante la UIF | el riesgo de no cumplir es alto |
| Consultoras / software factories | sus clientes preguntan y no tienen respuesta | entregar valor extra al cliente |
| Contadores y abogados (aliados) | les llega el cliente desordenado | expediente ya armado = menos horas |

⬜ Tamaño de cada segmento y precio: **sin medir** — se valida con entrevistas (sección 9).
Precios de partida propuestos por Artur: Learn gratis · Developer Pro $299 MXN/mes ·
Team $1,499 MXN/mes · Enterprise a cotizar.

## 4 · El flujo del usuario

```
 FOUNDER                      DONA                                   SALIDA
 ───────                      ────                                   ──────
 1 pega la URL de su landing ─┐
 2 sube su pitch (PDF)  ──────┼─▶ LEER ─────▶ PERFIL ──────▶ REGLAS ──────▶ EXPLICAR ─┬─▶ ① informe: cada obligación
                              │   la landing   hechos sí/no:   tarjetas        el agente  │     con su fuente y fecha
                              │   y las        ¿cobra fuera?   versionadas:    entrenado  ├─▶ ② el asesor en voz
                              │   fuentes      ¿datos          norma, artículo,  explica,  │     (preguntas en vivo)
                              │   oficiales    personales?     a quién aplica,   responde  ├─▶ ③ COMPLIANCE.md para su repo
                              │                ¿cripto? ¿I+D?  fuente, vigencia  y nunca   ├─▶ ④ pitch y landing corregidos
                              │                ¿contrata?                        inventa   └─▶ ⑤ «mandar a revisión
 3 pregunta lo que no entendió ◀──────────────────────────────── voz ─────────────────────        profesional»
```

En palabras: el founder entrega lo que ya tiene (2 cosas, cero formularios) → Dona lo lee →
saca hechos de sí/no → los cruza con reglas que tienen fuente y fecha → el agente lo explica en
lenguaje claro y en voz → el founder se lleva 5 entregables y, si quiere, lo manda a un profesional.

## 5 · Alcance — de dónde partimos y hasta dónde terminamos

| | Partimos (27-oct, 22:00) | Terminamos (28-oct, 17:00) | Después del hackathon |
|---|---|---|---|
| Producto | idea + propuesta de Artur + este flujo | el flujo de la sección 4 funcionando con **3 casos ficticios** | academia, simulador económico, laboratorio de riesgo, B2B (roadmap de Artur, fases 2-3) |
| Reglas | 0 tarjetas | 25-40 tarjetas verificadas con fuente | cientos, revisadas por especialistas, con alertas cuando cambia la ley |
| Agente | Dona ya existe: se presenta como Dona y tiene su identidad aprendida | entrenado con las tarjetas y los 3 casos | entrenado con la ley vigente completa |
| Repo | público, licencia MIT, vacío | motor + tarjetas + app, open source | comunidad que aporta tarjetas |
| Validación | ninguna | 3 entrevistas en la sede | Fase 0 de Artur: 3 casos de uso priorizados |

**Fuera del hackathon** (se dice en el pitch como «siguiente»): estrategia financiera, pipeline de
ventas y leads/CRM, simulaciones Monte Carlo, otros países.

## 6 · Limitaciones (lo que decimos con honestidad)

- Las reglas son tan buenas como su fuente y su fecha: la ley cambia durante el año.
- 25-40 tarjetas cubren lo frecuente, no todos los casos.
- El agente puede equivocarse al explicar: por eso la ley la pone la tarjeta, no el modelo.
  (Medido hoy: sin tarjetas, citó un artículo de memoria — está por verificar.)
- No es asesoría: cada informe lo dice y ofrece la revisión profesional.

## 7 · Áreas de oportunidad

1. **Un dataset abierto** de lo que la ley mexicana le exige a una startup tecnológica, con fuente y fecha — hoy no conocemos ninguno.
2. **Políticas para el repo** (COMPLIANCE.md): la ley llevada al lugar donde se construye, que también siguen los asistentes de código con IA.
3. **Alianza con contadores y abogados**: Dona les manda clientes con el expediente armado — es la «delegación full del servicio legal» sin ejercer sin cédula.
4. **Estímulo a I+D**: evidencia desde el primer commit (Evidence Builder de Artur).
5. **Cripto y fintech**: el riesgo UIF es alto y la información está dispersa.

## 8 · Dónde entran los patrocinadores

| Patrocinador | Papel en Dona | Reto | Estado |
|---|---|---|---|
| **Firecrawl** | LEER: la landing del founder y las páginas oficiales (SAT, DOF, IMSS, UIF) para fechar cada regla | Best Use of Firecrawl | ✅ elegido |
| **ElevenLabs** | la voz de Dona: lee el informe y responde preguntas habladas | Best Use of ElevenLabs | ✅ elegido |
| **MLH Open Source** | el motor de reglas + las tarjetas, donados con licencia MIT | Best Open-Source AI Project | ✅ viene con el repo |
| Gemma 4 | PERFIL: extraer los hechos sí/no del pitch con un modelo abierto (el pitch no sale de nuestra máquina) | Best Use of Gemma 4 | ⬜ opcional, ~1 h |
| n8n | revisar el DOF cada día y avisar si cambió una regla | Best n8n Integration | ⬜ opcional, ~1 h |
| MojoAuth | entrar sin contraseña para guardar tu expediente | Best Auth with MojoAuth | ⬜ opcional, ~30 min |
| Lovable | construir la web | Best Built with Lovable | ⬜ solo si la web se hace en Lovable |
| Tavily · Linear · Miro | búsqueda de fuentes · tareas del equipo · pizarrón | (perks) | apoyo |

## 9 · Cómo nos repartimos

**Brian y Artur escriben todo el código. Valeria lleva todo lo demás:** el debate de las preguntas,
la idea y la parte legal. Los tres frentes se conectan por dos contratos que se fijan primero
(30 min, juntos): la **tarjeta de regla** (la llena Valeria, la lee el motor) y el **JSON del informe**
(lo produce el motor, lo muestra la web).

| Frente | Quién | Hace | Hoy en la noche | Mañana 15:00 |
|---|---|---|---|---|
| Idea, legal, reglas y PERFIL | **Valeria** | debate de las preguntas · **PERFIL: qué hechos sí/no se sacan del pitch y cómo se detecta cada uno** · contenido de las tarjetas con fuente y fecha · 3 casos ficticios · avisos legales · pitch y guion · 3 entrevistas en sede | respuestas a las 🔴 + lista de hechos + 10 tarjetas + 3 casos | 25-40 verificadas + pitch |
| El agente y el motor (código) | **Brian** | **el agente: que funcione, la información que toma y la que entrega** · repo · motor de reglas · entrenamiento de Dona · API del informe | motor leyendo tarjetas + agente recibiendo el perfil | informe de los 3 casos |
| Lectura y producto (código) | **Artur** | **Firecrawl: leer la landing y las fuentes oficiales** · web · voz con ElevenLabs · entregables · video de respaldo | Firecrawl leyendo una landing + esqueleto web | demo ensayada |

**Mañana:** 13:00-15:00 integrar · 15:00 congelar · 15:00-16:30 ensayar la demo completa 3 veces · 17:00 demo.

## 10 · Para estar de acuerdo — 4 preguntas

1. ¿La definición de la sección 1 es la nuestra?
2. ¿El alcance de la sección 5 (y lo que queda fuera) está bien?
3. ¿Sumamos algún reto opcional de la sección 8?
4. ¿Quién toma cada frente?
