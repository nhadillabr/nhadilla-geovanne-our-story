import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { PageShell } from "@/components/page-shell";
import { Reveal } from "@/components/reveal";
import { wedding, categoriasPresentes } from "@/config/wedding";
import { listarPresentes, type Gift } from "@/lib/gifts.functions";

const presentesQuery = queryOptions({
  queryKey: ["presentes"],
  queryFn: () => listarPresentes(),
});

export const Route = createFileRoute("/lista-de-presentes")({
  head: () => ({
    meta: [
      { title: "Lista de Presentes — Nhadilla & Geovanne" },
      {
        name: "description",
        content:
          "Sugestões de presentes escolhidas por Nhadilla & Geovanne para o início da vida a dois.",
      },
      { property: "og:title", content: "Lista de Presentes — Nhadilla & Geovanne" },
      { property: "og:description", content: wedding.textoPresentes },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(presentesQuery),
  errorComponent: ({ error }) => (
    <PageShell>
      <p role="alert" className="px-6 py-32 text-center text-muted-foreground">
        {error.message}
      </p>
    </PageShell>
  ),
  notFoundComponent: () => (
    <PageShell>
      <p className="px-6 py-32 text-center text-muted-foreground">Nada por aqui.</p>
    </PageShell>
  ),
  component: ListaPresentes,
});

function formatarPreco(preco: number | null) {
  if (preco === null || preco === undefined) return null;
  return Number(preco).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function ListaPresentes() {
  const { data: presentes } = useSuspenseQuery(presentesQuery);
  const [categoria, setCategoria] = useState<string>("Todos");

  const categorias = [
    "Todos",
    ...categoriasPresentes.filter((c) => presentes.some((p) => p.categoria === c)),
    ...Array.from(new Set(presentes.map((p) => p.categoria))).filter(
      (c) => !categoriasPresentes.includes(c as (typeof categoriasPresentes)[number]),
    ),
  ];

  const visiveis =
    categoria === "Todos" ? presentes : presentes.filter((p) => p.categoria === categoria);

  return (
    <PageShell>
      <section className="mx-auto max-w-3xl px-6 pt-20 text-center">
        <h1 className="font-serif text-5xl text-foreground md:text-6xl">Lista de presentes</h1>
        <div className="rule-gold mx-auto my-8" />
        <p className="text-[15px] leading-relaxed text-muted-foreground">
          {wedding.textoPresentes}
        </p>
      </section>

      {presentes.length > 0 && (
        <div className="mx-auto mt-14 flex max-w-5xl flex-wrap justify-center gap-x-8 gap-y-3 px-6">
          {categorias.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategoria(c)}
              className={`border-b pb-1 text-[11px] tracking-editorial uppercase transition-colors ${
                categoria === c
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      <section className="mx-auto max-w-6xl px-6 py-16 pb-28">
        {presentes.length === 0 ? (
          <p className="py-16 text-center text-[13px] tracking-widest text-muted-foreground uppercase">
            A lista está sendo preparada com carinho. Em breve.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-x-10 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
            {visiveis.map((p, i) => (
              <Reveal key={p.id} delay={(i % 3) * 80}>
                <CardPresente presente={p} />
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </PageShell>
  );
}

function CardPresente({ presente }: { presente: Gift }) {
  const preco = formatarPreco(presente.preco);

  return (
    <article className="group flex h-full flex-col">
      <div className="aspect-[4/5] w-full overflow-hidden bg-secondary">
        {presente.imagem ? (
          <img
            src={presente.imagem}
            alt={presente.nome}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[10px] tracking-editorial text-muted-foreground uppercase">
            Sem imagem
          </div>
        )}
      </div>
      <p className="mt-5 text-[10px] tracking-editorial text-muted-foreground uppercase">
        {presente.categoria}
      </p>
      <h2 className="mt-2 font-serif text-2xl text-foreground">{presente.nome}</h2>
      {presente.descricao && (
        <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
          {presente.descricao}
        </p>
      )}
      {preco && <p className="mt-3 text-[13px] text-foreground">{preco}</p>}
      <div className="mt-5">
        {presente.url ? (
          <a
            href={presente.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block border border-primary px-6 py-3 text-[11px] tracking-editorial text-primary uppercase transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            Ver presente
          </a>
        ) : (
          <span className="inline-block border border-border px-6 py-3 text-[11px] tracking-editorial text-muted-foreground/70 uppercase">
            Link em breve
          </span>
        )}
      </div>
    </article>
  );
}
