// Temporary test page: proves frontend → /api/chat → agent works end to end.
// Artur replaces it with the real product (docs/ESTADO.md).
import { ChatTest } from "./chat-test";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-12">
      <header className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold tracking-tight">Donna</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Tu asesora de cumplimiento para startups tecnológicas en México.
        </p>
      </header>
      <ChatTest />
    </main>
  );
}
