import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Prose } from "@/components/prose";
import { Crest, Empty } from "@/components/ui";
import { getComunicado } from "@/lib/club-content";
import { fmtDate, fmtDay } from "@/lib/format";

async function Comunicado({ params }: { params: Promise<{ id: string }> }) {
  const c = await getComunicado(Number((await params).id));
  if (!c) notFound();
  return (
    <article>
      <Link href="/club" className="inline-flex min-h-11 items-center text-base text-ink-2 hover:text-ink">
        ← El club
      </Link>
      <header className="mt-6 mb-10 border-b border-line pb-8">
        <p className="mb-4 flex flex-wrap items-center gap-3">
          <span className="tv bg-loss px-2 pt-1 pb-0.5 text-xl text-white">Comunicado oficial</span>
          <span className="text-base text-ink-2 first-letter:uppercase">{fmtDay(c.publicadoAt)}</span>
        </p>
        <h1 className="tv text-6xl sm:text-7xl">{c.titulo}</h1>
      </header>
      <Prose text={c.cuerpo} />
      <footer className="mt-12 flex items-center gap-4 border-t border-line pt-8">
        <Crest size={44} />
        <div>
          <p className="text-lg font-semibold">{c.firma}</p>
          {c.editadoAt ? <p className="text-sm text-ink-2">Editado el {fmtDate(c.editadoAt)} hs</p> : null}
        </div>
      </footer>
    </article>
  );
}

export default function ComunicadoPage({ params }: PageProps<"/club/comunicados/[id]">) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Suspense fallback={<Empty>Cargando comunicado…</Empty>}>
        <Comunicado params={params} />
      </Suspense>
    </div>
  );
}
