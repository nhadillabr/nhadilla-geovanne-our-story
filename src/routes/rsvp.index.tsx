import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState, type FormEvent } from "react";
import { PageShell } from "@/components/page-shell";
import { AvisoLista, RsvpConvite } from "@/components/rsvp-convite";
import { buscarConvidado, type GuestPublic } from "@/lib/rsvp.functions";

export const Route = createFileRoute("/rsvp/")({
  head: () => ({
    meta: [
      { title: "Confirmação de presença — Nhadilla & Geovanne" },
      {
        name: "description",
        content:
          "Confirme sua presença no casamento de Nhadilla & Geovanne, 03 de julho de 2027, Uberlândia — MG.",
      },
      { property: "og:title", content: "Confirmação de presença — Nhadilla & Geovanne" },
      { property: "og:description", content: "Digite seu nome para confirmar sua presença." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: RsvpBusca,
});

function RsvpBusca() {
  const buscar = useServerFn(buscarConvidado);
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [convidado, setConvidado] = useState<GuestPublic | null>(null);
  const [opcoes, setOpcoes] = useState<{ codigo: string; dica: string }[] | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    setOpcoes(null);
    if (nome.trim().length < 3) {
      setErro("Digite seu nome completo, como consta no convite.");
      return;
    }
    setCarregando(true);
    try {
      const res = await buscar({ data: { nome } });
      if (res.resultado === "encontrado") setConvidado(res.convidado);
      else if (res.resultado === "ambiguo") setOpcoes(res.opcoes);
      else
        setErro(
          "Não encontramos esse nome. Verifique se digitou o nome completo exatamente como no convite.",
        );
    } catch {
      setErro("Não foi possível concluir a busca agora. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  if (convidado) {
    return (
      <PageShell>
        <section className="py-24">
          <RsvpConvite inicial={convidado} />
        </section>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <section className="mx-auto max-w-2xl px-6 py-24 text-center">
        <p className="text-[11px] tracking-editorial text-muted-foreground uppercase">
          Confirmação de presença
        </p>
        <h1 className="mt-6 font-serif text-4xl text-foreground md:text-5xl">
          Digite seu nome para confirmar sua presença.
        </h1>
        <div className="rule-gold mx-auto my-8" />

        <form onSubmit={onSubmit} className="mx-auto mt-4 max-w-md space-y-4 text-left">
          <label htmlFor="nome" className="sr-only">
            Nome completo
          </label>
          <input
            id="nome"
            value={nome}
            maxLength={120}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Nome completo"
            autoComplete="name"
            className="w-full border-b border-input bg-transparent px-1 py-3 text-center text-[15px] text-foreground outline-none placeholder:text-muted-foreground/70 focus:border-primary"
          />
          <button
            type="submit"
            disabled={carregando}
            className="w-full border border-primary bg-primary px-8 py-4 text-[11px] tracking-editorial text-primary-foreground uppercase transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {carregando ? "Buscando…" : "Buscar meu convite"}
          </button>
        </form>

        {opcoes && (
          <div className="mt-10">
            <p className="text-[13px] text-muted-foreground">
              Encontramos mais de um convite com esse nome. Selecione a inicial do seu sobrenome:
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              {opcoes.map((o) => (
                <button
                  key={o.codigo}
                  type="button"
                  onClick={() => navigate({ to: "/rsvp/$codigo", params: { codigo: o.codigo } })}
                  className="border border-border px-6 py-3 font-serif text-lg text-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  {o.dica}
                </button>
              ))}
            </div>
          </div>
        )}

        {erro && <p className="mt-8 text-[13px] text-destructive">{erro}</p>}

        <AvisoLista />
      </section>
    </PageShell>
  );
}
