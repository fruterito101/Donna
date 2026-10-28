// Canonical public entry to the existing professional contact workspace.
import { createFileRoute } from '@tanstack/react-router';
import { Operations } from '@/components/intake/Operations';

export const Route = createFileRoute('/professional-contact')({
  head: () => ({
    meta: [
      { title: 'Donna · Centro de contacto profesional' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
    links: [{ rel: 'canonical', href: 'https://donna-mx.vercel.app/professional-contact' }],
  }),
  component: Operations,
});
