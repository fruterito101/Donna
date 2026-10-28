// GENERATED from rules/ by `npm run rules` — edit rules/*.yaml, never this file.
import type { FactCatalog, RuleCard } from "./index.ts";

export const FACTS: FactCatalog = {
  "cobra_al_extranjero": {
    "question": "¿Cobras a clientes fuera de México?",
    "signals": [
      "clientes en EE. UU.",
      "precios en USD"
    ]
  },
  "guarda_datos_personales": {
    "question": "¿Guardas datos de personas (nombres, correos, perfiles)?",
    "signals": [
      "registro de usuarios",
      "perfiles",
      "correos"
    ]
  },
  "opera_activos_virtuales": {
    "question": "¿Recibes, guardas o transfieres criptomonedas?",
    "signals": [
      "pagos en cripto",
      "wallet",
      "stablecoins"
    ]
  },
  "hace_id_tecnologico": {
    "question": "¿Desarrollas tecnología nueva con incertidumbre técnica?",
    "signals": [
      "modelo propio",
      "algoritmo nuevo",
      "I+D"
    ]
  },
  "tiene_empleados": {
    "question": "¿Contratas personas?",
    "signals": [
      "equipo de N",
      "vacantes"
    ]
  },
  "factura_en_mexico": {
    "question": "¿Emites facturas en México?",
    "signals": [
      "precios en MXN",
      "clientes mexicanos"
    ]
  },
  "tiene_marca_propia": {
    "question": "¿Usas un nombre o logo comercial?",
    "signals": [
      "nombre del producto"
    ]
  }
};

export const RULES: RuleCard[] = [];
