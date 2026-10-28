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
  "ofrece_servicios_de_activos_virtuales": {
    "question": "¿Tu plataforma compra, vende, guarda o envía criptomonedas que son de tus clientes (por ejemplo, un exchange, una wallet o un servicio de pagos con cripto para otros)?",
    "signals": [
      "exchange",
      "wallet para tus usuarios",
      "custodia",
      "compra y venta de cripto",
      "on-ramp / off-ramp"
    ]
  },
  "recibe_pagos_en_cripto": {
    "question": "¿Tus clientes te pagan con criptomonedas por lo que tú vendes?",
    "signals": [
      "aceptamos cripto",
      "pagos en USDT / BTC",
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
  },
  "tiene_ingresos": {
    "question": "¿Tu negocio ya cobra por lo que vende (en México o fuera), aunque sea poco?",
    "signals": [
      "precios",
      "planes de pago",
      "clientes que pagan"
    ]
  },
  "infraestructura_en_mexico": {
    "question": "¿Todo lo que usas para dar tu servicio está en México (servidores, equipo y personas)?",
    "signals": [
      "hosting en México",
      "centro de datos en México",
      "equipo en México"
    ]
  },
  "desarrolla_software": {
    "question": "¿Tu negocio crea su propio software (una app, una plataforma o un modelo de IA)?",
    "signals": [
      "app",
      "plataforma",
      "SaaS",
      "modelo propio"
    ]
  }
};

export const RULES: RuleCard[] = [
  {
    "id": "datos-aviso-de-privacidad",
    "authority": "DATOS",
    "kind": "obligation",
    "title": "Publicar un aviso de privacidad completo",
    "requires": "Si guardas o usas datos de personas, debes informarles en un aviso de privacidad qué datos tratas y para qué. Debe decir al menos quién eres y tu domicilio, qué datos usas (señalando los sensibles), para qué los usas, cómo pueden limitar su uso, cómo ejercer sus derechos ARCO (acceso, rectificación, cancelación y oposición) y cómo les avisarás de cambios.",
    "applies_if": [
      "guarda_datos_personales"
    ],
    "evidence": [
      "aviso de privacidad publicado y fechado",
      "registro de dónde y cuándo se muestra a cada persona"
    ],
    "law": "Ley Federal de Protección de Datos Personales en Posesión de los Particulares, arts. 14 y 15",
    "source": "https://www.diputados.gob.mx/LeyesBiblio/pdf/LFPDPPP.pdf",
    "source_quote": "Artículo 14. El responsable tendrá la obligación de informar a la persona titular, a través del aviso de privacidad, la existencia y características principales del tratamiento al que serán sometidos sus datos personales, a fin de que pueda tomar decisiones informadas al respecto.",
    "valid_from": "2025-03-21",
    "verified_by": "Brian López",
    "verified_on": "2026-10-28",
    "frequency": "once",
    "consequence": {
      "description": "Omitir en el aviso de privacidad alguno de los elementos del art. 15 es infracción, con multa de 100 a 160,000 veces la UMA.",
      "law": "LFPDPPP art. 58 fr. V y art. 59 fr. II",
      "source": "https://www.diputados.gob.mx/LeyesBiblio/pdf/LFPDPPP.pdf"
    },
    "x_nota": "Borrador investigado el 2026-10-28 desde el PDF oficial de la Cámara de Diputados; firmado por Brian López el 2026-10-28 al comparar la cita con la fuente; las dudas de abajo siguen abiertas para Valeria. La cita se copió del PDF quitando espacios que mete la extracción: compárala con la fuente. Es la NUEVA ley publicada en el DOF el 20-03-2025 (última reforma 14-11-2025); valid_from = día siguiente, según su transitorio Primero, salvo lo del transitorio Tercero, que no se revisó."
  },
  {
    "id": "estimulo-id-tecnologico",
    "authority": "ESTIMULO",
    "kind": "benefit",
    "title": "Estímulo fiscal a la investigación y desarrollo de tecnología",
    "requires": "Un crédito fiscal del 30% de lo que gastes o inviertas en proyectos propios de investigación o desarrollo tecnológico hechos en México, aplicable contra tu ISR. Solo cuenta lo que gastes por encima del promedio de tus tres años anteriores, tiene un tope de 50 millones de pesos por contribuyente y hay que cumplir las reglas del Comité Interinstitucional, que pide prototipos o entregables y patentes registradas en México. No se combina con otros estímulos o beneficios fiscales.",
    "applies_if": [
      "hace_id_tecnologico"
    ],
    "evidence": [
      "descripción de cada proyecto de I+D y su avance tecnológico",
      "registro de gastos e inversiones por proyecto",
      "prototipos, entregables y solicitudes de patente"
    ],
    "law": "Ley del Impuesto sobre la Renta, art. 202",
    "source": "https://www.diputados.gob.mx/LeyesBiblio/pdf/LISR.pdf",
    "source_quote": "Artículo 202. Se otorga un estímulo fiscal a los contribuyentes del impuesto sobre la renta que efectúen proyectos de investigación y desarrollo tecnológico, consistente en aplicar un crédito fiscal equivalente al 30% de los gastos e inversiones realizados en el ejercicio en investigación o desarrollo de tecnología, contra el impuesto sobre la renta causado en el ejercicio en que se determine dicho crédito.",
    "valid_from": "2016-11-30",
    "verified_by": "Brian López",
    "verified_on": "2026-10-28",
    "frequency": "annual",
    "x_nota": "Borrador investigado el 2026-10-28 desde el PDF oficial de la Cámara de Diputados; firmado por Brian López el 2026-10-28 al comparar la cita con la fuente; las dudas de abajo siguen abiertas para Valeria. La cita se copió del PDF quitando espacios que mete la extracción: compárala con la fuente. valid_from = DOF en que se adicionó el artículo (la fr. I se reformó el 09-12-2019); la entrada en vigor no se revisó. El PDF de la LISR dice «Última reforma DOF 01-04-2024»: confirmar que no hay una más reciente. Para Valeria: ¿el régimen RESICO cuenta como «otro tratamiento fiscal» incompatible? ¿Las reglas del Comité y la convocatoria de este año siguen abiertas? Ojo: el agente citó antes el art. 189, que es el estímulo al cine."
  },
  {
    "id": "imss-registro-patronal",
    "authority": "IMSS",
    "kind": "obligation",
    "title": "Registrarte como patrón e inscribir a tu equipo en el IMSS",
    "requires": "Si contratas personas, debes registrarte ante el IMSS, inscribir a tus trabajadores y avisar sus altas, bajas y cambios de salario en un plazo no mayor a cinco días hábiles. También debes llevar nóminas con días trabajados y salarios, y conservarlas cinco años.",
    "applies_if": [
      "tiene_empleados"
    ],
    "evidence": [
      "registro patronal",
      "avisos de alta, baja y modificación de salario",
      "nóminas de los últimos cinco años"
    ],
    "law": "Ley del Seguro Social, art. 15 fr. I y II",
    "source": "https://www.diputados.gob.mx/LeyesBiblio/pdf/LSS.pdf",
    "source_quote": "I. Registrarse e inscribir a sus trabajadores en el Instituto, comunicar sus altas y bajas, las modificaciones de su salario y los demás datos, dentro de plazos no mayores de cinco días hábiles;",
    "valid_from": "2001-12-20",
    "verified_by": "",
    "frequency": "per_event",
    "x_nota": "Borrador investigado el 2026-10-28 desde el PDF oficial de la Cámara de Diputados; falta que una persona lo verifique. La cita se copió del PDF quitando espacios que mete la extracción: compárala con la fuente. valid_from = DOF de la reforma de la fr. I. No se investigó la multa (falta revisar los arts. 304-A y 304-B de la LSS). Para Valeria: ¿cómo cuentan los colaboradores por honorarios o los que trabajan desde otro país?"
  },
  {
    "id": "iva-tasa-cero-exportacion-ti",
    "authority": "SAT",
    "kind": "benefit",
    "title": "IVA al 0% al exportar servicios de tecnologías de la información",
    "requires": "Si das servicios de tecnologías de la información (desarrollo de software, alojamiento de aplicaciones, procesamiento o almacenamiento de datos) que se aprovechan en el extranjero, el IVA se calcula al 0%. Condición: usar en su totalidad infraestructura tecnológica, personas y materiales ubicados en México, y que la dirección IP desde la que das el servicio esté en México y la de tu cliente en el extranjero.",
    "applies_if": [
      "cobra_al_extranjero",
      "desarrolla_software",
      "infraestructura_en_mexico"
    ],
    "evidence": [
      "contratos con clientes en el extranjero",
      "prueba de que tus servidores y tu equipo están en México",
      "registros de las direcciones IP de prestación y de recepción del servicio"
    ],
    "law": "Ley del Impuesto al Valor Agregado, art. 29 fr. IV inciso i)",
    "source": "https://www.diputados.gob.mx/LeyesBiblio/pdf/LIVA.pdf",
    "source_quote": "1. Utilicen en su totalidad infraestructura tecnológica, recursos humanos y materiales, ubicados en territorio nacional.",
    "valid_from": "2016-11-30",
    "verified_by": "",
    "x_nota": "Borrador investigado el 2026-10-28 desde el PDF oficial de la Cámara de Diputados; falta que una persona lo verifique. La cita se copió del PDF quitando espacios que mete la extracción: compárala con la fuente. valid_from = DOF en que se adicionó el inciso i). El artículo empieza «Las empresas residentes en el país»: para Valeria, ¿aplica también a un freelance persona física? El PDF dice «Última reforma DOF 12-11-2021»: confirmar que no hay una más reciente."
  },
  {
    "id": "pi-registro-de-marca",
    "authority": "PI",
    "kind": "benefit",
    "title": "Registrar tu marca en el IMPI",
    "requires": "Puedes usar tu nombre o logo comercial sin registrarlo, pero el derecho a usarlo de forma exclusiva (que nadie más lo use para lo mismo) solo se obtiene registrándolo en el Instituto Mexicano de la Propiedad Industrial.",
    "applies_if": [
      "tiene_marca_propia"
    ],
    "evidence": [
      "solicitud y título de registro de marca"
    ],
    "law": "Ley Federal de Protección a la Propiedad Industrial, art. 170",
    "source": "https://www.diputados.gob.mx/LeyesBiblio/pdf/LFPPI.pdf",
    "source_quote": "Artículo 170.- Cualquier persona, física o moral, podrá hacer uso de marcas en la industria, en el comercio o en los servicios que presten. Sin embargo, el derecho a su uso exclusivo se obtiene mediante su registro en el Instituto.",
    "valid_from": "2020-07-01",
    "verified_by": "",
    "frequency": "once",
    "x_nota": "Borrador investigado el 2026-10-28 desde el PDF oficial de la Cámara de Diputados; falta que una persona lo verifique. La cita se copió del PDF quitando espacios que mete la extracción: compárala con la fuente. valid_from = DOF de publicación de la ley; su transitorio PRIMERO dice que entró en vigor a los noventa días hábiles siguientes (fecha exacta sin calcular)."
  },
  {
    "id": "pi-registro-de-software",
    "authority": "PI",
    "kind": "benefit",
    "title": "Registrar tu software ante el Registro Público del Derecho de Autor",
    "requires": "Tu software, incluido el de inteligencia artificial, está protegido como obra literaria, en código fuente y en código objeto. Inscribirlo en el Registro Público del Derecho de Autor da seguridad jurídica y publicidad a quién es su autor y titular.",
    "applies_if": [
      "desarrolla_software"
    ],
    "evidence": [
      "certificado de registro de la obra (software)",
      "contratos de cesión de derechos con quienes programan"
    ],
    "law": "Ley Federal del Derecho de Autor, arts. 102 y 162",
    "source": "https://www.diputados.gob.mx/LeyesBiblio/pdf/LFDA.pdf",
    "source_quote": "Artículo 102.- Los programas de computación, incluidos los de inteligencia artificial, se protegen en los mismos términos que las obras literarias.",
    "valid_from": "2026-05-14",
    "verified_by": "",
    "frequency": "once",
    "x_nota": "Borrador investigado el 2026-10-28 desde el PDF oficial de la Cámara de Diputados; falta que una persona lo verifique. La cita se copió del PDF quitando espacios que mete la extracción: compárala con la fuente. valid_from = DOF de la reforma del art. 102 que agregó «incluidos los de inteligencia artificial». La evidencia «contratos de cesión» es una propuesta: falta el artículo que la respalde."
  },
  {
    "id": "sat-emitir-cfdi",
    "authority": "SAT",
    "kind": "obligation",
    "title": "Emitir facturas electrónicas (CFDI)",
    "requires": "Cuando cobras por lo que vendes, debes emitir el comprobante fiscal digital (CFDI) a través del SAT y entregarlo a tu cliente. Para hacerlo necesitas la firma electrónica (e.firma) vigente y estar inscrito en el RFC.",
    "applies_if": [
      "tiene_ingresos"
    ],
    "evidence": [
      "los CFDI emitidos por cada cobro",
      "e.firma vigente"
    ],
    "law": "Código Fiscal de la Federación, art. 29",
    "source": "https://www.diputados.gob.mx/LeyesBiblio/pdf/CFF.pdf",
    "source_quote": "Artículo 29. Cuando las leyes fiscales establezcan la obligación de expedir comprobantes fiscales por los actos o actividades que realicen, por los ingresos que se perciban o por las retenciones de contribuciones que efectúen, los contribuyentes deberán emitirlos mediante documentos digitales a través de la página de Internet del Servicio de Administración Tributaria.",
    "valid_from": "2021-11-12",
    "verified_by": "",
    "frequency": "per_event",
    "consequence": {
      "description": "Multa de $22,300 a $127,530 por no expedir o no entregar el CFDI; si reincides, pueden clausurar el establecimiento de 3 a 15 días.",
      "law": "CFF art. 83 fr. VII y art. 84 fr. IV inciso a)",
      "source": "https://www.diputados.gob.mx/LeyesBiblio/pdf/CFF.pdf"
    },
    "x_nota": "Borrador investigado el 2026-10-28 desde el PDF oficial de la Cámara de Diputados; falta que una persona lo verifique. La cita se copió del PDF quitando espacios que mete la extracción: compárala con la fuente. valid_from = DOF de la reforma del primer párrafo (12-11-2021). Para Valeria: ¿cobrar al extranjero también exige CFDI? (casi seguro sí, pero falta la fuente). Los montos de la multa se actualizan cada año."
  },
  {
    "id": "sat-inscripcion-rfc",
    "authority": "SAT",
    "kind": "obligation",
    "title": "Inscribirte en el RFC",
    "requires": "Si debes presentar declaraciones o emitir facturas electrónicas (CFDI) por lo que cobras, tienes que inscribirte en el Registro Federal de Contribuyentes y mantener actualizados tu domicilio, tu situación fiscal, un correo y un teléfono. Si tu negocio es una sociedad, además tiene obligaciones sobre sus socios y accionistas.",
    "applies_if": [
      "tiene_ingresos"
    ],
    "evidence": [
      "constancia de situación fiscal",
      "acuses de los avisos de actualización"
    ],
    "law": "Código Fiscal de la Federación, art. 27, apartados A y B",
    "source": "https://www.diputados.gob.mx/LeyesBiblio/pdf/CFF.pdf",
    "source_quote": "I. Las personas físicas y personas morales están obligadas a dar cumplimiento a las fracciones I, II, III y IV del apartado B del presente artículo, siempre que: a) Deban presentar declaraciones periódicas, o b) Estén obligadas a expedir comprobantes fiscales digitales por Internet por los actos o actividades que realicen o por los ingresos que perciban.",
    "valid_from": "2021-11-12",
    "verified_by": "Brian López",
    "verified_on": "2026-10-28",
    "frequency": "once",
    "consequence": {
      "description": "Multa de $5,070 a $15,200 por no inscribirte cuando estás obligado o hacerlo tarde (salvo si lo haces de manera espontánea).",
      "law": "CFF art. 79 fr. I y art. 80 fr. I",
      "source": "https://www.diputados.gob.mx/LeyesBiblio/pdf/CFF.pdf"
    },
    "x_nota": "Borrador investigado el 2026-10-28 desde el PDF oficial de la Cámara de Diputados; firmado por Brian López el 2026-10-28 al comparar la cita con la fuente; las dudas de abajo siguen abiertas para Valeria. La cita se copió del PDF quitando espacios que mete la extracción: compárala con la fuente. valid_from = DOF de la reforma del apartado (12-11-2021). Los montos de la multa son los actualizados en el DOF 28-12-2025 según la nota del PDF; cambian cada año."
  },
  {
    "id": "uif-activos-virtuales",
    "authority": "UIF",
    "kind": "obligation",
    "title": "Avisos a la UIF por servicios con activos virtuales",
    "requires": "Si tu plataforma compra, vende, custodia o transfiere activos virtuales que son de tus clientes, haces una Actividad Vulnerable: debes identificar a cada cliente con documentos oficiales, conservar la información de sus operaciones y presentar un Aviso a Hacienda cuando la operación de un cliente llegue a 210 veces la UMA diaria o tu comisión llegue a 4 veces la UMA diaria. Solo recibir cripto como pago por tu propio producto no aparece en esta fracción.",
    "applies_if": [
      "ofrece_servicios_de_activos_virtuales"
    ],
    "evidence": [
      "expediente de identificación de cada cliente",
      "registro de las operaciones con activos virtuales",
      "acuses de los Avisos presentados"
    ],
    "law": "Ley Federal para la Prevención e Identificación de Operaciones con Recursos de Procedencia Ilícita, art. 17 fr. XVI y art. 18",
    "source": "https://www.diputados.gob.mx/LeyesBiblio/pdf/LFPIORPI.pdf",
    "source_quote": "XVI. El ofrecimiento habitual y profesional de intercambio de activos virtuales por parte de sujetos distintos a las Entidades Financieras, que se lleven a cabo a través de plataformas electrónicas, digitales o similares, que administren u operen, facilitando o realizando operaciones de compra o venta de dichos activos propiedad de sus clientes o bien, provean medios para custodiar, almacenar, o transferir activos virtuales distintos a los reconocidos por el Banco de México en términos de la Ley para Regular las Instituciones de Tecnología Financiera, incluidas las operaciones que se realicen con ciudadanos mexicanos desde otra jurisdicción.",
    "valid_from": "2025-07-17",
    "verified_by": "Brian López",
    "verified_on": "2026-10-28",
    "frequency": "per_event",
    "consequence": {
      "description": "Multa de 200 a 2,000 veces el valor diario de la UMA por incumplir las obligaciones del art. 18 o no presentar a tiempo los Avisos.",
      "law": "LFPIORPI art. 53 fr. II y III, art. 54 fr. I",
      "source": "https://www.diputados.gob.mx/LeyesBiblio/pdf/LFPIORPI.pdf"
    },
    "x_nota": "Borrador investigado el 2026-10-28 desde el PDF oficial de la Cámara de Diputados; firmado por Brian López el 2026-10-28 al comparar la cita con la fuente; las dudas de abajo siguen abiertas para Valeria. La cita se copió del PDF quitando espacios que mete la extracción: compárala con la fuente. valid_from = día siguiente a la reforma del DOF 16-07-2025 (su transitorio Primero dice «al día siguiente de su publicación, salvo las excepciones»); las excepciones no se revisaron. Para Valeria: ¿recibir cripto como pago por un SaaS propio queda fuera de toda obligación ante la UIF, o hay otra fracción que lo alcance?"
  }
];
