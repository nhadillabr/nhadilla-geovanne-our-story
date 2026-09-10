import { createFileRoute } from "@tanstack/react-router";
import { PageShell, SectionTitle } from "@/components/page-shell";
import { Reveal } from "@/components/reveal";
import { paleta, wedding } from "@/config/wedding";

export const Route = createFileRoute("/o-casamento")({
  head: () => ({
    meta: [
      { title: "O Casamento — Nhadilla & Geovanne" },
      {
        name: "description",
        content:
          "A paleta de cores e os detalhes do casamento de Nhadilla & Geovanne, em 03 de julho de 2027, em Uberlândia — MG.",
      },
      { property: "og:title", content: "O Casamento — Nhadilla & Geovanne" },
      {
        property: "og:description",
        content: "A paleta de cores e os detalhes do nosso dia.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OCasamento,
});

/**
 * Seções futuras (cerimônia, recepção, dress code, local, horários, nossa
 * história, como chegar, hospedagem, FAQ, contato) podem ser adicionadas
 * incluindo novos itens no array abaixo.
 */
const proximasSecoes = [
  "Cerimônia",
  "Recepção",
  "Dress code",
  "Local",
  "Horários",
  "Nossa história",
  "Como chegar",
  "Hospedagem",
  "Informações importantes",
  "Perguntas frequentes",
  "Contato",
];

function OCasamento() {
  return (
    <PageShell>
      <section className="mx-auto max-w-3xl px-6 pt-20 pb-4 text-center">
        <p className="text-[11px] tracking-editorial text-muted-foreground uppercase">
          {wedding.dataTexto}
        </p>
        <h1 className="mt-6 font-serif text-5xl text-foreground md:text-6xl">O nosso casamento</h1>
        <div className="rule-gold mx-auto mt-8" />
      </section>

      <section className="mx-auto max-w-5xl px-6 py-20">
        <Reveal>
          <SectionTitle kicker="Identidade" title="Paleta de cores" />
          <p className="mx-auto mt-8 max-w-2xl text-center text-[15px] leading-relaxed text-muted-foreground">
            {wedding.paletaTexto}
          </p>
        </Reveal>

        <div className="mt-16 grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 md:grid-cols-5">
          {paleta.map((cor, i) => (
            <Reveal key={cor.hex} delay={i * 60}>
              <div className="text-center">
                <div
                  className="mx-auto aspect-square w-full max-w-[110px] rounded-full border border-border/70"
                  style={{ backgroundColor: cor.hex }}
                  aria-hidden
                />
                <p className="mt-4 text-[10px] tracking-editorial text-muted-foreground uppercase">
                  {cor.nome}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-28">
        <Reveal>
          <div className="border-t border-border/60 pt-14">
            <p className="text-center text-[11px] tracking-editorial text-muted-foreground uppercase">
              Em breve
            </p>
            <ul className="mx-auto mt-8 grid max-w-3xl grid-cols-1 gap-y-3 text-center sm:grid-cols-2 md:grid-cols-3">
              {proximasSecoes.map((secao) => (
                <li key={secao} className="font-serif text-lg text-foreground/60">
                  {secao}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </section>
    </PageShell>
  );
}
