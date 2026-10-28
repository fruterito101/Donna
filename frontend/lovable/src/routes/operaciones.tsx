import { createFileRoute } from '@tanstack/react-router';
import { Operations } from '@/components/intake/Operations';
const title='Donna · Centro de prospectos';
const description='Vista operativa de los prospectos autorizados durante esta sesión de Donna, pendientes de integración y entrega profesional.';
export const Route=createFileRoute('/operaciones')({head:()=>({meta:[{title},{name:'description',content:description},{property:'og:title',content:title},{property:'og:description',content:description},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),component:Operations});
