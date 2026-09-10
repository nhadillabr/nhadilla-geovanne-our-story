import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { PageShell } from "@/components/page-shell";
import { categoriasPresentes } from "@/config/wedding";
import {
  listarPresentesAdmin,
  salvarPresente,
  excluirPresente,
  type AdminGift,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/presentes")({
  head: () => ({
    meta: [
      { title: "Administração — Presentes" },
      { name: "description", content: "Gestão da lista de presentes." },
      { property: "og:title", content: "Administração — Presentes" },
      { property: "og:description", content: "Gestão da lista de presentes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPresentes,
});

type Form = {
  id?: string;
  nome: string;
  descricao: string;
  preco: string;
  imagem: string;
  categoria: string;
  url: string;
  ativo: boolean;
  ordem: string;
};

const vazio: Form = {
  nome: "",
  descricao: "",
  preco: "",
  imagem: "",
  categoria: categoriasPresentes[0] ?? "Casa",
  url: "",
  ativo: true,
  ordem: "0",
};

function AdminPresentes() {
  const listar = useServerFn(listarPresentesAdmin);
  const salvar = useServerFn(salvarPresente);
  const excluir = useServerFn(excluirPresente);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "presentes"],
    queryFn: () => listar(),
  });

  const [form, setForm] = useState<Form>(vazio);
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  function editar(p: AdminGift) {
    setForm({
      id: p.id,
      nome: p.nome,
      descricao: p.descricao ?? "",
      preco: p.preco === null ? "" : String(p.preco),
      imagem: p.imagem ?? "",
      categoria: p.categoria,
      url: p.url ?? "",
      ativo: p.ativo,
      ordem: String(p.ordem),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function enviar() {
    setErro(null);
    setSalvando(true);
    try {
      await salvar({
        data: {
          ...(form.id ? { id: form.id } : {}),
          nome: form.nome.trim(),
          descricao: form.descricao.trim() || null,
          preco: form.preco.trim() === "" ? null : Number(form.preco),
          imagem: form.imagem.trim(),
          categoria: form.categoria.trim(),
          url: form.url.trim(),
          ativo: form.ativo,
          ordem: Number(form.ordem) || 0,
        },
      });
      setForm(vazio);
      qc.invalidateQueries({ queryKey: ["admin", "presentes"] });
    } catch {
      setErro("Verifique os campos. Links devem ser endereços completos (https://…).");
    } finally {
      setSalvando(false);
    }
  }

  async function remover(p: AdminGift) {
    if (!confirm(`Remover ${p.nome}?`)) return;
    await excluir({ data: { id: p.id } });
    qc.invalidateQueries({ queryKey: ["admin", "presentes"] });
  }

  const campo =
    "mt-2 w-full border-b border-input bg-transparent py-2 text-[15px] outline-none focus:border-primary";
  const rotulo = "text-[10px] tracking-editorial text-muted-foreground uppercase";

  return (
    <PageShell>
      <section className="mx-auto max-w-5xl px-6 py-20">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="font-serif text-4xl text-foreground">Presentes</h1>
          <Link
            to="/admin"
            className="border border-border px-5 py-2 text-[11px] tracking-editorial text-foreground uppercase hover:border-primary hover:text-primary"
          >
            Convidados
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 border border-border/70 p-8 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className={rotulo} htmlFor="g-nome">
              Nome
            </label>
            <input
              id="g-nome"
              className={campo}
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
            />
          </div>
          <div className="md:col-span-2">
            <label className={rotulo} htmlFor="g-desc">
              Descrição
            </label>
            <input
              id="g-desc"
              className={campo}
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
            />
          </div>
          <div>
            <label className={rotulo} htmlFor="g-preco">
              Preço (R$)
            </label>
            <input
              id="g-preco"
              inputMode="decimal"
              className={campo}
              value={form.preco}
              onChange={(e) => setForm({ ...form, preco: e.target.value })}
            />
          </div>
          <div>
            <label className={rotulo} htmlFor="g-cat">
              Categoria
            </label>
            <input
              id="g-cat"
              list="categorias"
              className={campo}
              value={form.categoria}
              onChange={(e) => setForm({ ...form, categoria: e.target.value })}
            />
            <datalist id="categorias">
              {categoriasPresentes.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>
          <div className="md:col-span-2">
            <label className={rotulo} htmlFor="g-url">
              Link da loja (https://…)
            </label>
            <input
              id="g-url"
              className={campo}
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
            />
          </div>
          <div className="md:col-span-2">
            <label className={rotulo} htmlFor="g-img">
              Imagem (URL)
            </label>
            <input
              id="g-img"
              className={campo}
              value={form.imagem}
              onChange={(e) => setForm({ ...form, imagem: e.target.value })}
            />
          </div>
          <div>
            <label className={rotulo} htmlFor="g-ordem">
              Ordem
            </label>
            <input
              id="g-ordem"
              inputMode="numeric"
              className={campo}
              value={form.ordem}
              onChange={(e) => setForm({ ...form, ordem: e.target.value })}
            />
          </div>
          <label className="flex items-end gap-3 text-[13px] text-foreground">
            <input
              type="checkbox"
              checked={form.ativo}
              onChange={(e) => setForm({ ...form, ativo: e.target.checked })}
            />
            Visível no site
          </label>

          <div className="flex gap-4 md:col-span-2">
            <button
              type="button"
              onClick={enviar}
              disabled={salvando}
              className="border border-primary bg-primary px-8 py-3 text-[11px] tracking-editorial text-primary-foreground uppercase disabled:opacity-60"
            >
              {form.id ? "Salvar alterações" : "Adicionar presente"}
            </button>
            {form.id && (
              <button
                type="button"
                onClick={() => setForm(vazio)}
                className="border border-border px-8 py-3 text-[11px] tracking-editorial text-muted-foreground uppercase"
              >
                Cancelar
              </button>
            )}
          </div>
          {erro && <p className="text-[13px] text-destructive md:col-span-2">{erro}</p>}
        </div>

        {isLoading && <p className="mt-12 text-muted-foreground">Carregando…</p>}

        <ul className="mt-12 divide-y divide-border/60 border-y border-border/60">
          {(data ?? []).map((p) => (
            <li key={p.id} className="flex flex-wrap items-center gap-4 py-5">
              <div className="min-w-[220px] flex-1">
                <p className="font-serif text-xl text-foreground">{p.nome}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {p.categoria} · {p.ativo ? "visível" : "oculto"} · {p.url ? "com link" : "sem link"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => editar(p)}
                className="border border-border px-4 py-2 text-[11px] tracking-editorial text-foreground uppercase"
              >
                Editar
              </button>
              <button
                type="button"
                onClick={() => remover(p)}
                className="text-[11px] tracking-editorial text-destructive uppercase"
              >
                Remover
              </button>
            </li>
          ))}
        </ul>
      </section>
    </PageShell>
  );
}
