import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageShell } from "@/components/page-shell";

export const Route = createFileRoute("/entrar")({
  head: () => ({
    meta: [
      { title: "Área restrita — Nhadilla & Geovanne" },
      { name: "description", content: "Acesso restrito à administração do site do casamento." },
      { property: "og:title", content: "Área restrita — Nhadilla & Geovanne" },
      { property: "og:description", content: "Acesso restrito." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Entrar,
});

function Entrar() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    setCarregando(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
    setCarregando(false);
    if (error) {
      setErro("E-mail ou senha inválidos.");
      return;
    }
    navigate({ to: "/admin" });
  }

  return (
    <PageShell>
      <section className="mx-auto max-w-md px-6 py-28">
        <h1 className="text-center font-serif text-4xl text-foreground">Área restrita</h1>
        <div className="rule-gold mx-auto my-8" />
        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="text-[10px] tracking-editorial text-muted-foreground uppercase"
            >
              E-mail
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full border-b border-input bg-transparent py-2 text-[15px] text-foreground outline-none focus:border-primary"
            />
          </div>
          <div>
            <label
              htmlFor="senha"
              className="text-[10px] tracking-editorial text-muted-foreground uppercase"
            >
              Senha
            </label>
            <input
              id="senha"
              type="password"
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="mt-2 w-full border-b border-input bg-transparent py-2 text-[15px] text-foreground outline-none focus:border-primary"
            />
          </div>
          <button
            type="submit"
            disabled={carregando}
            className="w-full border border-primary bg-primary px-8 py-4 text-[11px] tracking-editorial text-primary-foreground uppercase disabled:opacity-60"
          >
            {carregando ? "Entrando…" : "Entrar"}
          </button>
          {erro && <p className="text-center text-[13px] text-destructive">{erro}</p>}
        </form>
      </section>
    </PageShell>
  );
}
