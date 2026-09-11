import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { responderRsvp, type GuestPublic } from "@/lib/rsvp.functions";
import { wedding } from "@/config/wedding";

export function AvisoLista() {
  return (
    <p className="mx-auto mt-14 max-w-2xl border-t border-border/60 pt-8 text-center text-[13px] leading-relaxed text-muted-foreground/90">
      {wedding.textoListaConvidados}
    </p>
  );
}

export function RsvpConvite({ inicial }: { inicial: GuestPublic }) {
  const [convidado, setConvidado] = useState(inicial);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState<"confirmado" | "nao_comparecera" | null>(null);
  const [selecionados, setSelecionados] = useState<string[]>(
    inicial.status === "pendente"
      ? inicial.membros.map((m) => m.id)
      : inicial.membros.filter((m) => m.confirmado).map((m) => m.id),
  );
  const responder = useServerFn(responderRsvp);

  const temAcompanhantes = convidado.membros.length > 0;

  async function enviar(status: "confirmado" | "nao_comparecera") {
    setErro(null);
    setEnviando(status);
    try {
      const res = await responder({
        data: {
          codigo: convidado.codigo,
          status,
          presentes: status === "confirmado" ? selecionados : [],
        },
      });
      if (res.ok) setConvidado(res.convidado);
      else setErro("Não encontramos este convite.");
    } catch {
      setErro("Não foi possível registrar sua resposta. Tente novamente.");
    } finally {
      setEnviando(null);
    }
  }

  const respondido = convidado.status !== "pendente";
  const titulo = convidado.grupo ? convidado.grupo : convidado.nome;

  return (
    <div className="mx-auto max-w-2xl px-6 text-center">
      <p className="text-[11px] tracking-editorial text-muted-foreground uppercase">
        Confirmação de presença
      </p>
      <h1 className="mt-6 font-serif text-4xl text-foreground md:text-5xl">
        Encontramos seu convite.
      </h1>
      <p className="mt-4 font-serif text-2xl text-foreground/80">{titulo}</p>
      <div className="rule-gold mx-auto my-8" />

      {!respondido && (
        <p className="text-[15px] leading-relaxed text-muted-foreground">
          {temAcompanhantes
            ? "Será uma alegria ter vocês conosco para celebrar esse momento tão especial."
            : "Será uma alegria ter você conosco para celebrar esse momento tão especial."}
        </p>
      )}

      {convidado.status === "confirmado" && (
        <div className="space-y-2">
          <p className="font-serif text-2xl text-foreground">Presença confirmada com sucesso.</p>
          <p className="text-[15px] text-muted-foreground">
            Será uma alegria celebrar esse momento com você.
          </p>
        </div>
      )}

      {convidado.status === "nao_comparecera" && (
        <div className="space-y-2">
          <p className="font-serif text-2xl text-foreground">Agradecemos por nos avisar.</p>
          <p className="text-[15px] text-muted-foreground">
            Sentiremos sua falta, mas ficamos felizes pelo carinho e por fazer parte da nossa
            história.
          </p>
        </div>
      )}

      {temAcompanhantes && convidado.status !== "nao_comparecera" && (
        <div className="mx-auto mt-10 max-w-sm text-left">
          <p className="text-center text-[11px] tracking-editorial text-muted-foreground uppercase">
            Quem estará presente?
          </p>
          <ul className="mt-5 space-y-3">
            {convidado.membros.map((m) => (
              <li key={m.id}>
                <label className="flex items-center gap-3 border-b border-border/60 pb-3 text-[15px] text-foreground">
                  <input
                    type="checkbox"
                    checked={selecionados.includes(m.id)}
                    onChange={(e) =>
                      setSelecionados((s) =>
                        e.target.checked ? [...s, m.id] : s.filter((id) => id !== m.id),
                      )
                    }
                    className="h-4 w-4 accent-[var(--color-primary)]"
                  />
                  {m.nome}
                </label>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[12px] text-muted-foreground">
            Este convite permite até {convidado.max_pessoas}{" "}
            {convidado.max_pessoas === 1 ? "pessoa" : "pessoas"}.
          </p>
        </div>
      )}

      <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
        <button
          type="button"
          disabled={enviando !== null}
          onClick={() => enviar("confirmado")}
          className={`px-8 py-4 text-[11px] tracking-editorial uppercase transition-colors disabled:opacity-60 ${
            convidado.status === "confirmado"
              ? "border border-primary bg-primary text-primary-foreground"
              : "border border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          }`}
        >
          {enviando === "confirmado"
            ? "Registrando…"
            : temAcompanhantes
              ? "Sim, estaremos presentes"
              : "Sim, estarei presente"}
        </button>
        <button
          type="button"
          disabled={enviando !== null}
          onClick={() => enviar("nao_comparecera")}
          className={`px-8 py-4 text-[11px] tracking-editorial uppercase transition-colors disabled:opacity-60 ${
            convidado.status === "nao_comparecera"
              ? "border border-foreground bg-foreground text-background"
              : "border border-border text-muted-foreground hover:border-foreground hover:text-foreground"
          }`}
        >
          {enviando === "nao_comparecera" ? "Registrando…" : "Infelizmente não poderei comparecer"}
        </button>
      </div>

      {respondido && (
        <p className="mt-6 text-[12px] text-muted-foreground/80">
          Se precisar, você pode alterar sua resposta a qualquer momento nesta página.
        </p>
      )}

      {erro && <p className="mt-6 text-[13px] text-destructive">{erro}</p>}

      <AvisoLista />
    </div>
  );
}
