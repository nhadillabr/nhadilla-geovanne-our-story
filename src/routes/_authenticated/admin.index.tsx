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
  listarPresentesAdmin,
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

type Edicao = {
  id: string;
  nome: string;
  grupo: string;
  max_pessoas: string;
  observacoes: string;
  membros: string;
};

function AdminConvidados() {
  const listar = useServerFn(listarConvidados);
  const listarGifts = useServerFn(listarPresentesAdmin);
  const criar = useServerFn(criarConvidado);
  const atualizar = useServerFn(atualizarConvidado);
  const excluir = useServerFn(excluirConvidado);
  const qc = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "convidados"],
    queryFn: () => listar(),
  });
  const { data: presentes } = useQuery({
    queryKey: ["admin", "presentes"],
    queryFn: () => listarGifts(),
  });

  const [novoNome, setNovoNome] = useState("");
  const [novoGrupo, setNovoGrupo] = useState("");
  const [novoMax, setNovoMax] = useState("1");
  const [novosMembros, setNovosMembros] = useState("");
  const [filtro, setFiltro] = useState<"todos" | AdminGuest["status"]>("todos");
  const [busca, setBusca] = useState("");
  const [grupoFiltro, setGrupoFiltro] = useState("todos");
  const [salvando, setSalvando] = useState(false);
  const [edicao, setEdicao] = useState<Edicao | null>(null);

  const convidados = data ?? [];
  const total = convidados.length;
  const confirmados = convidados.filter((c) => c.status === "confirmado").length;
  const recusados = convidados.filter((c) => c.status === "nao_comparecera").length;
  const pendentes = convidados.filter((c) => c.status === "pendente").length;
  const pessoasConfirmadas = convidados
    .filter((c) => c.status === "confirmado")
    .reduce((acc, c) => acc + (c.membros.length ? c.membros.filter((m) => m.confirmado).length : 1), 0);

  const grupos = Array.from(
    new Set(convidados.map((c) => c.grupo).filter((g): g is string => Boolean(g))),
  );

  const visiveis = convidados
    .filter((c) => filtro === "todos" || c.status === filtro)
    .filter((c) => grupoFiltro === "todos" || c.grupo === grupoFiltro)
    .filter((c) =>
      `${c.nome} ${c.grupo ?? ""}`.toLowerCase().includes(busca.trim().toLowerCase()),
    );

  function refetch() {
    qc.invalidateQueries({ queryKey: ["admin", "convidados"] });
  }

  async function adicionar() {
    if (novoNome.trim().length < 2) return;
    setSalvando(true);
    await criar({
      data: {
        nome: novoNome.trim(),
        grupo: novoGrupo.trim() || null,
        max_pessoas: Math.max(1, Number(novoMax) || 1),
        status: "pendente",
        membros: novosMembros
          .split(",")
          .map((m) => m.trim())
          .filter((m) => m.length >= 2),
      },
    });
    setNovoNome("");
    setNovoGrupo("");
    setNovoMax("1");
    setNovosMembros("");
    setSalvando(false);
    refetch();
  }

  async function mudarStatus(c: AdminGuest, status: AdminGuest["status"]) {
    await atualizar({
      data: {
        id: c.id,
        nome: c.nome,
        grupo: c.grupo,
        max_pessoas: c.max_pessoas,
        status,
        observacoes: c.observacoes,
        membros: c.membros.map((m) => m.nome),
      },
    });
    refetch();
  }

  async function salvarEdicao(c: AdminGuest) {
    if (!edicao) return;
    await atualizar({
      data: {
        id: c.id,
        nome: edicao.nome.trim(),
        grupo: edicao.grupo.trim() || null,
        max_pessoas: Math.max(1, Number(edicao.max_pessoas) || 1),
        status: c.status,
        observacoes: edicao.observacoes.trim() || null,
        membros: edicao.membros
          .split(",")
          .map((m) => m.trim())
          .filter((m) => m.length >= 2),
      },
    });
    setEdicao(null);
    refetch();
  }

  async function remover(c: AdminGuest) {
    if (!confirm(`Remover ${c.nome} da lista?`)) return;
    await excluir({ data: { id: c.id } });
    refetch();
  }

  async function sair() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    window.location.replace("/entrar");
  }

  const campo =
    "w-full border-b border-input bg-transparent py-2 text-[15px] outline-none focus:border-primary";

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
            { label: "Convites", valor: total },
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

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            { label: "Pessoas confirmadas", valor: pessoasConfirmadas },
            { label: "Presentes cadastrados", valor: presentes?.length ?? 0 },
            {
              label: "Presentes disponíveis",
              valor: (presentes ?? []).filter((p) => p.status === "disponivel" && p.ativo).length,
            },
          ].map((k) => (
            <div key={k.label} className="border border-border/70 p-6 text-center">
              <p className="font-serif text-3xl text-foreground">{k.valor}</p>
              <p className="mt-2 text-[10px] tracking-editorial text-muted-foreground uppercase">
                {k.label}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 border border-border/70 p-8 md:grid-cols-2">
          <input
            value={novoNome}
            onChange={(e) => setNovoNome(e.target.value)}
            placeholder="Nome completo do convidado principal"
            className={campo}
          />
          <input
            value={novoGrupo}
            onChange={(e) => setNovoGrupo(e.target.value)}
            placeholder="Grupo / família (opcional)"
            className={campo}
          />
          <input
            value={novoMax}
            inputMode="numeric"
            onChange={(e) => setNovoMax(e.target.value)}
            placeholder="Quantidade de pessoas"
            className={campo}
          />
          <input
            value={novosMembros}
            onChange={(e) => setNovosMembros(e.target.value)}
            placeholder="Acompanhantes, separados por vírgula"
            className={campo}
          />
          <div className="md:col-span-2">
            <button
              type="button"
              onClick={adicionar}
              disabled={salvando}
              className="border border-primary bg-primary px-6 py-3 text-[11px] tracking-editorial text-primary-foreground uppercase disabled:opacity-60"
            >
              Adicionar convite
            </button>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-6">
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome ou grupo"
            className="min-w-[200px] flex-1 border-b border-input bg-transparent py-2 text-[14px] outline-none focus:border-primary"
          />
          {grupos.length > 0 && (
            <select
              value={grupoFiltro}
              onChange={(e) => setGrupoFiltro(e.target.value)}
              className="border border-border bg-transparent px-3 py-2 text-[12px] text-foreground"
            >
              <option value="todos">Todos os grupos</option>
              {grupos.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          )}
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
            <li key={c.id} className="py-5">
              <div className="flex flex-wrap items-center gap-4">
                <div className="min-w-[200px] flex-1">
                  <p className="font-serif text-xl text-foreground">{c.nome}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {statusLabel[c.status]}
                    {c.grupo ? ` · ${c.grupo}` : ""} · até {c.max_pessoas}{" "}
                    {c.max_pessoas === 1 ? "pessoa" : "pessoas"}
                    {" · link: "}
                    <span className="break-all">/rsvp/{c.codigo}</span>
                  </p>
                  {c.membros.length > 0 && (
                    <p className="mt-1 text-[11px] text-muted-foreground/80">
                      {c.membros
                        .map((m) => `${m.nome}${m.respondido ? (m.confirmado ? " ✓" : " ✕") : ""}`)
                        .join(" · ")}
                    </p>
                  )}
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
                  onClick={() =>
                    setEdicao(
                      edicao?.id === c.id
                        ? null
                        : {
                            id: c.id,
                            nome: c.nome,
                            grupo: c.grupo ?? "",
                            max_pessoas: String(c.max_pessoas),
                            observacoes: c.observacoes ?? "",
                            membros: c.membros.map((m) => m.nome).join(", "),
                          },
                    )
                  }
                  className="border border-border px-4 py-2 text-[11px] tracking-editorial text-foreground uppercase"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => remover(c)}
                  className="text-[11px] tracking-editorial text-destructive uppercase"
                >
                  Remover
                </button>
              </div>

              {edicao?.id === c.id && (
                <div className="mt-5 grid grid-cols-1 gap-5 border border-border/70 p-6 md:grid-cols-2">
                  <input
                    value={edicao.nome}
                    onChange={(e) => setEdicao({ ...edicao, nome: e.target.value })}
                    placeholder="Nome"
                    className={campo}
                  />
                  <input
                    value={edicao.grupo}
                    onChange={(e) => setEdicao({ ...edicao, grupo: e.target.value })}
                    placeholder="Grupo / família"
                    className={campo}
                  />
                  <input
                    value={edicao.max_pessoas}
                    inputMode="numeric"
                    onChange={(e) => setEdicao({ ...edicao, max_pessoas: e.target.value })}
                    placeholder="Quantidade de pessoas"
                    className={campo}
                  />
                  <input
                    value={edicao.membros}
                    onChange={(e) => setEdicao({ ...edicao, membros: e.target.value })}
                    placeholder="Acompanhantes, separados por vírgula"
                    className={campo}
                  />
                  <input
                    value={edicao.observacoes}
                    onChange={(e) => setEdicao({ ...edicao, observacoes: e.target.value })}
                    placeholder="Observações"
                    className={`${campo} md:col-span-2`}
                  />
                  <div className="flex gap-4 md:col-span-2">
                    <button
                      type="button"
                      onClick={() => salvarEdicao(c)}
                      className="border border-primary bg-primary px-6 py-3 text-[11px] tracking-editorial text-primary-foreground uppercase"
                    >
                      Salvar
                    </button>
                    <button
                      type="button"
                      onClick={() => setEdicao(null)}
                      className="border border-border px-6 py-3 text-[11px] tracking-editorial text-muted-foreground uppercase"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
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
