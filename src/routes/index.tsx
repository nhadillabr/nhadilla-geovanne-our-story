import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";
import { Countdown } from "@/components/countdown";
import { Reveal } from "@/components/reveal";
import { wedding } from "@/config/wedding";
import heroPlaceholder from "@/assets/hero-placeholder.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nhadilla & Geovanne — 03.07.2027" },
      {
        name: "description",
        content:
          "Save the date do casamento de Nhadilla & Geovanne, 03 de julho de 2027, em Uberlândia — MG. Confirme sua presença.",
      },
      { property: "og:title", content: "Nhadilla & Geovanne — 03.07.2027" },
      {
        property: "og:description",
        content: "Uma nova história começa aqui. 03 de julho de 2027, Uberlândia — MG.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  const imagem = wedding.heroImagem || heroPlaceholder;

  return (
    <PageShell>
      <section className="mx-auto max-w-6xl px-6 pt-16 pb-10 md:pt-24">
        <div className="reveal text-center">
          <p className="text-[11px] tracking-editorial text-muted-foreground uppercase">
            Save the date
          </p>
          <h1 className="mt-6 font-serif text-5xl leading-[1.05] text-foreground md:text-7xl">
            Nhadilla
            <span className="mx-3 text-dourado">&</span>
            Geovanne
          </h1>
          <div className="rule-gold mx-auto my-8" />
          <p className="text-[12px] tracking-editorial text-muted-foreground uppercase">
            {wedding.dataTexto} — {wedding.cidade}
          </p>
          <p className="mt-8 font-serif text-2xl text-foreground/80 italic md:text-3xl">
            “{wedding.frase}”
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6">
        <Reveal>
          <figure className="relative">
            <img
              src={imagem}
              alt="Fotografia de referência para o casamento de Nhadilla e Geovanne"
              width={1600}
              height={1104}
              className="h-[46vh] w-full object-cover md:h-[70vh]"
            />
            {wedding.heroPlaceholder && (
              <figcaption className="absolute bottom-0 left-0 bg-background/85 px-4 py-2 text-[10px] tracking-editorial text-muted-foreground uppercase">
                Imagem provisória — será substituída pela foto do casal
              </figcaption>
            )}
          </figure>
        </Reveal>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-20">
        <Reveal>
          <Countdown />
        </Reveal>
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-28 text-center">
        <Reveal>
          <Link
            to="/rsvp"
            className="inline-block w-full border border-primary bg-primary px-10 py-4 text-[12px] tracking-editorial text-primary-foreground uppercase transition-opacity hover:opacity-90 sm:w-auto"
          >
            Confirmar presença
          </Link>
          <div className="mt-6 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              to="/o-casamento"
              className="border border-border px-8 py-3 text-[11px] tracking-editorial text-foreground uppercase transition-colors hover:border-primary hover:text-primary"
            >
              O Casamento
            </Link>
            <Link
              to="/lista-de-presentes"
              className="border border-border px-8 py-3 text-[11px] tracking-editorial text-foreground uppercase transition-colors hover:border-primary hover:text-primary"
            >
              Lista de Presentes
            </Link>
          </div>
        </Reveal>
      </section>
    </PageShell>
  );
}
