import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { PageShell } from "@/components/page-shell";
import {
  listarConvidados,
  criarConvidado,
  atualizarConvidado,
  excluirConvidado,
  type AdminGuest,
} from "@/lib/admin.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({
    meta: [
      { title: "Administração — Convidados" },
      { name: "description", content: "Gestão de convidados do casamento." },
      { property: "og:title", content: "Administração — Convidados" },
      { property: "og:description", content: "Gestão de convidados." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminConvidados,
});

const statusLabel: Record<AdminGuest["status"], string> = {
  pendente: "Pendente",
  confirmado: "Confirmado",
  nao_comparecera: "Não comparecerá",
};

function AdminConvidados() {
  const listar = useServerFn(listarConvidados);
  const criar = useServerFn(criarConvidado);
  const atualizar = useServerFn(atualizarConvidado);
  const excluir = useServerFn(excluirConvidado);
  const qc = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "convidados"],
    queryFn: () => listar(),
  });

  const [novoNome, setNovoNome] = useState("");
  const [filtro, setFiltro] = useState<"todos" | AdminGuest["status"]>("todos");
  const [busca, setBusca] = useState("");
  const [salvando, setSalvando] = useState(false);

  const convidados = data ?? [];
  const total = convidados.length;
  const confirmados = convidados.filter((c) => c.status === "confirmado").length;
  const recusados = convidados.filter((c) => c.status === "nao_comparecera").length;
  const pendentes = convidados.filter((c) => c.status === "pendente").length;

  const visiveis = convidados
    .filter((c) => filtro === "todos" || c.status === filtro)
    .filter((c) => c.nome.toLowerCase().includes(busca.trim().toLowerCase()));

  async function adicionar() {
    if (novoNome.trim().length < 2) return;
    setSalvando(true);
    await criar({ data: { nome: novoNome.trim(), status: "pendente" } });
    setNovoNome("");
    setSalvando(false);
    qc.invalidateQueries({ queryKey: ["admin", "convidados"] });
  }

  async function mudarStatus(c: AdminGuest, status: AdminGuest["status"]) {
    await atualizar({ data: { id: c.id, nome: c.nome, status, observacoes: c.observacoes } });
    qc.invalidateQueries({ queryKey: ["admin", "convidados"] });
  }

  async function remover(c: AdminGuest) {
    if (!confirm(`Remover ${c.nome} da lista?`)) return;
    await excluir({ data: { id: c.id } });
    qc.invalidateQueries({ queryKey: ["admin", "convidados"] });
  }

  async function sair() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    window.location.replace("/entrar");
  }

  return (
    <PageShell>
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="font-serif text-4xl text-foreground">Convidados</h1>
          <div className="flex gap-4">
            <Link
              to="/admin/presentes"
              className="border border-border px-5 py-2 text-[11px] tracking-editorial text-foreground uppercase hover:border-primary hover:text-primary"
            >
              Presentes
            </Link>
            <button
              type="button"
              onClick={sair}
              className="border border-border px-5 py-2 text-[11px] tracking-editorial text-muted-foreground uppercase hover:text-foreground"
            >
              Sair
            </button>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-4">
          {[
            { label: "Total", valor: total },
            { label: "Confirmados", valor: confirmados },
            { label: "Não comparecerão", valor: recusados },
            { label: "Pendentes", valor: pendentes },
          ].map((k) => (
            <div key={k.label} className="border border-border/70 p-6 text-center">
              <p className="font-serif text-3xl text-foreground">{k.valor}</p>
              <p className="mt-2 text-[10px] tracking-editorial text-muted-foreground uppercase">
                {k.label}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap gap-3">
          <input
            value={novoNome}
            onChange={(e) => setNovoNome(e.target.value)}
            placeholder="Nome completo do convidado"
            className="min-w-[240px] flex-1 border-b border-input bg-transparent py-2 text-[15px] outline-none focus:border-primary"
          />
          <button
            type="button"
            onClick={adicionar}
            disabled={salvando}
            className="border border-primary bg-primary px-6 py-3 text-[11px] tracking-editorial text-primary-foreground uppercase disabled:opacity-60"
          >
            Adicionar
          </button>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-6">
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome"
            className="min-w-[200px] flex-1 border-b border-input bg-transparent py-2 text-[14px] outline-none focus:border-primary"
          />
          <div className="flex flex-wrap gap-4">
            {(["todos", "pendente", "confirmado", "nao_comparecera"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFiltro(f)}
                className={`border-b pb-1 text-[11px] tracking-editorial uppercase ${
                  filtro === f
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground"
                }`}
              >
                {f === "todos" ? "Todos" : statusLabel[f]}
              </button>
            ))}
          </div>
        </div>

        {isLoading && <p className="mt-12 text-muted-foreground">Carregando…</p>}
        {error && (
          <p role="alert" className="mt-12 text-destructive">
            Não foi possível carregar a lista.
          </p>
        )}

        <ul className="mt-10 divide-y divide-border/60 border-y border-border/60">
          {visiveis.map((c) => (
            <li key={c.id} className="flex flex-wrap items-center gap-4 py-5">
              <div className="min-w-[200px] flex-1">
                <p className="font-serif text-xl text-foreground">{c.nome}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {statusLabel[c.status]}
                  {" · link: "}
                  <span className="break-all">/rsvp/{c.codigo}</span>
                </p>
              </div>
              <select
                value={c.status}
                onChange={(e) => mudarStatus(c, e.target.value as AdminGuest["status"])}
                className="border border-border bg-transparent px-3 py-2 text-[12px] text-foreground"
              >
                <option value="pendente">Pendente</option>
                <option value="confirmado">Confirmado</option>
                <option value="nao_comparecera">Não comparecerá</option>
              </select>
              <button
                type="button"
                onClick={() =>
                  navigator.clipboard?.writeText(`${window.location.origin}/rsvp/${c.codigo}`)
                }
                className="border border-border px-4 py-2 text-[11px] tracking-editorial text-muted-foreground uppercase hover:text-foreground"
              >
                Copiar link
              </button>
              <button
                type="button"
                onClick={() => remover(c)}
                className="text-[11px] tracking-editorial text-destructive uppercase"
              >
                Remover
              </button>
            </li>
          ))}
        </ul>
        {!isLoading && visiveis.length === 0 && (
          <p className="mt-10 text-muted-foreground">Nenhum convidado nesta seleção.</p>
        )}
      </section>
    </PageShell>
  );
}
