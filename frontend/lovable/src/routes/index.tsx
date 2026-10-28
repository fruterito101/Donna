import { createFileRoute } from "@tanstack/react-router";
import { Comparison } from "@/components/donna/Comparison";
import { Demo } from "@/components/donna/Demo";
import { Closing, Faq, Header, Hero, Professionals, Topics } from "@/components/donna/Sections";
import { useDemoPlayer } from "@/components/donna/useDemoPlayer";

const TITLE = "Donna · Prepara el trabajo para tu contador o abogado";
const DESC = "Sabes de código y de producto. Donna te ayuda a entender qué revisar, ordenar tus documentos y llegar a tu contador o abogado con un expediente claro.";

export const Route = createFileRoute("/")({
  head: () => ({
    links: [{ rel: "canonical", href: "https://donna-mx.vercel.app/" }],
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const player = useDemoPlayer();
  const restart = () => player.dispatch({ type: "restart" });

  return (
    <>
      <a href="#contenido" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-card focus:p-3">Saltar al contenido</a>
      <Header onDemo={restart} />
      <main id="contenido">
        <Hero onStart={restart} />
        <Topics />
        <Comparison />
        <section id="recorrido" aria-labelledby="h-como" className="bg-primary-gradient">
          <div className="mx-auto max-w-6xl px-5 py-20 lg:py-24">
          <div className="mb-8 grid gap-4 lg:grid-cols-12">
            <h2 id="h-como" className="text-section text-primary-foreground lg:col-span-6">Así trabaja Donna</h2>
            <p className="text-[15px] text-accent lg:col-span-5 lg:col-start-8 lg:self-end">
              Mira cómo Donna acompaña a Nube Clara, una startup que desarrolla software con IA: de la primera conversación al resumen para su contador. Avanza sola; elige un paso para pausarlo.
            </p>
          </div>
          <Demo player={player} />
          </div>
        </section>
        <Professionals />
        <Faq />
        <Closing onDemo={restart} />
      </main>
    </>
  );
}
