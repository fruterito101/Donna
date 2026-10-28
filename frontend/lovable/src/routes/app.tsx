import { createFileRoute } from '@tanstack/react-router';
import { Workspace } from '@/components/workspace/Workspace';
const title = 'Donna · Tu espacio de trabajo';
const description = 'Prepara el contexto de tu negocio, organiza documentos y reúne preguntas para tu contador o abogado en el espacio guiado de Donna.';
export const Route = createFileRoute('/app')({
  head: () => ({ meta:[{ title }, { name:'description', content:description }, { property:'og:title', content:title }, { property:'og:description', content:description }, { property:'og:type', content:'website' }, { name:'twitter:card', content:'summary_large_image' }] }),
  component: Workspace,
});
