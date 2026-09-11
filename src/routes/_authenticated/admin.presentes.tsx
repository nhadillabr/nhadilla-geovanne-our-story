import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { PageShell } from "@/components/page-shell";
import { categoriasPresentes } from "@/config/wedding";
import { supabase } from "@/integrations/supabase/client";
import {
  listarPresentesAdmin,
  salvarPresente,
  excluirPresente,
  removerImagemPresente,
  urlImagemPresente,
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
  imagemUrl: string;
  categoria: string;
  loja: string;
  url: string;
  ativo: boolean;
  status: "disponivel" | "reservado" | "oculto";
  ordem: string;
};

const vazio: Form = {
  nome: "",
  descricao: "",
  preco: "",
  imagem: "",
  imagemUrl: "",
  categoria: categoriasPresentes[0] ?? "Casa",
  loja: "",
  url: "",
  ativo: true,
  status: "disponivel",
  ordem: "0",
};

function AdminPresentes() {
  const listar = useServerFn(listarPresentesAdmin);
  const salvar = useServerFn(salvarPresente);
  const excluir = useServerFn(excluirPresente);
  const removerImagem = useServerFn(removerImagemPresente);
  const assinarUrl = useServerFn(urlImagemPresente);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "presentes"],
    queryFn: () => listar(),
  });

  const [form, setForm] = useState<Form>(vazio);
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [enviandoImagem, setEnviandoImagem] = useState(false);

  const presentes = data ?? [];
  const total = presentes.length;
  const disponiveis = presentes.filter((p) => p.status === "disponivel" && p.ativo).length;
  const reservados = presentes.filter((p) => p.status === "reservado").length;

  function editar(p: AdminGift) {
    setForm({
      id: p.id,
      nome: p.nome,
      descricao: p.descricao ?? "",
      preco: p.preco === null ? "" : String(p.preco),
      imagem: p.imagem ?? "",
      imagemUrl: p.imagemUrl ?? "",
      categoria: p.categoria,
      loja: p.loja ?? "",
      url: p.url ?? "",
      ativo: p.ativo,
      status: p.status,
      ordem: String(p.ordem),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function enviarImagem(file: File) {
    setErro(null);
    setEnviandoImagem(true);
    try {
      const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase();
      const path = `presentes/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage
        .from("gift-images")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (error) throw error;

      const anterior = form.imagem;
      const { url } = await assinarUrl({ data: { path } });
      setForm((f) => ({ ...f, imagem: path, imagemUrl: url ?? "" }));
      if (anterior && !/^https?:\/\//i.test(anterior)) {
        await removerImagem({ data: { path: anterior } });
      }
    } catch {
      setErro("Não foi possível enviar a imagem. Tente novamente.");
    } finally {
      setEnviandoImagem(false);
    }
  }

  async function limparImagem() {
    const anterior = form.imagem;
    setForm((f) => ({ ...f, imagem: "", imagemUrl: "" }));
    if (anterior && !/^https?:\/\//i.test(anterior)) {
      await removerImagem({ data: { path: anterior } });
    }
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
          preco: form.preco.trim() === "" ? null : Number(form.preco.replace(",", ".")),
          imagem: form.imagem.trim(),
          categoria: form.categoria.trim(),
          loja: form.loja.trim() || null,
          url: form.url.trim(),
          ativo: form.ativo,
          status: form.status,
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

        <div className="mt-10 grid grid-cols-3 gap-6 border-y border-border/60 py-6 text-center">
          {[
            { label: "Cadastrados", valor: total },
            { label: "Disponíveis", valor: disponiveis },
            { label: "Reservados", valor: reservados },
          ].map((i) => (
            <div key={i.label}>
              <p className="font-serif text-3xl text-foreground">{i.valor}</p>
              <p className={rotulo}>{i.label}</p>
            </div>
          ))}
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
          <div>
            <label className={rotulo} htmlFor="g-loja">
              Loja
            </label>
            <input
              id="g-loja"
              className={campo}
              value={form.loja}
              onChange={(e) => setForm({ ...form, loja: e.target.value })}
            />
          </div>
          <div>
            <label className={rotulo} htmlFor="g-status">
              Status
            </label>
            <select
              id="g-status"
              className={campo}
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as Form["status"] })}
            >
              <option value="disponivel">Disponível</option>
              <option value="reservado">Reservado</option>
              <option value="oculto">Oculto</option>
            </select>
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
            <p className={rotulo}>Imagem</p>
            <div className="mt-3 flex flex-wrap items-center gap-5">
              <div className="h-28 w-24 overflow-hidden bg-secondary">
                {form.imagemUrl || /^https?:\/\//i.test(form.imagem) ? (
                  <img
                    src={form.imagemUrl || form.imagem}
                    alt="Pré-visualização do presente"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[9px] tracking-editorial text-muted-foreground uppercase">
                    Sem foto
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void enviarImagem(f);
                    e.target.value = "";
                  }}
                  className="block text-[13px] text-muted-foreground"
                />
                {enviandoImagem && (
                  <p className="text-[12px] text-muted-foreground">Enviando imagem…</p>
                )}
                {form.imagem && (
                  <button
                    type="button"
                    onClick={() => void limparImagem()}
                    className="text-[11px] tracking-editorial text-destructive uppercase"
                  >
                    Remover imagem
                  </button>
                )}
              </div>
            </div>
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
          {presentes.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center gap-4 py-5">
              <div className="h-16 w-14 shrink-0 overflow-hidden bg-secondary">
                {p.imagemUrl && (
                  <img src={p.imagemUrl} alt={p.nome} className="h-full w-full object-cover" />
                )}
              </div>
              <div className="min-w-[220px] flex-1">
                <p className="font-serif text-xl text-foreground">{p.nome}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {p.categoria}
                  {p.loja ? ` · ${p.loja}` : ""} · {p.status} ·{" "}
                  {p.ativo ? "visível" : "oculto"} · {p.url ? "com link" : "sem link"}
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
