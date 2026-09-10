import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";
import { RsvpConvite } from "@/components/rsvp-convite";
import { obterConvidado } from "@/lib/rsvp.functions";

export const Route = createFileRoute("/rsvp/$codigo")({
  head: () => ({
    meta: [
      { title: "Seu convite — Nhadilla & Geovanne" },
      {
        name: "description",
        content: "Convite individual para o casamento de Nhadilla & Geovanne.",
      },
      { property: "og:title", content: "Seu convite — Nhadilla & Geovanne" },
      { property: "og:description", content: "Confirme sua presença no nosso casamento." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  loader: async ({ params }) => {
    const res = await obterConvidado({ data: { codigo: params.codigo } });
    if (!res.encontrado) throw notFound();
    return res.convidado;
  },
  errorComponent: () => (
    <PageShell>
      <ConviteIndisponivel titulo="Não conseguimos abrir seu convite" />
    </PageShell>
  ),
  notFoundComponent: () => (
    <PageShell>
      <ConviteIndisponivel titulo="Convite não encontrado" />
    </PageShell>
  ),
  component: ConvitePorCodigo,
});

function ConviteIndisponivel({ titulo }: { titulo: string }) {
  return (
    <section className="mx-auto max-w-2xl px-6 py-32 text-center">
      <h1 className="font-serif text-4xl text-foreground">{titulo}</h1>
      <div className="rule-gold mx-auto my-8" />
      <p className="text-[15px] text-muted-foreground">
        Verifique o link recebido ou busque seu convite pelo nome.
      </p>
      <Link
        to="/rsvp"
        className="mt-8 inline-block border border-primary px-8 py-3 text-[11px] tracking-editorial text-primary uppercase transition-colors hover:bg-primary hover:text-primary-foreground"
      >
        Buscar pelo nome
      </Link>
    </section>
  );
}

function ConvitePorCodigo() {
  const convidado = Route.useLoaderData();
  return (
    <PageShell>
      <section className="py-24">
        <RsvpConvite inicial={convidado} />
      </section>
    </PageShell>
  );
}
