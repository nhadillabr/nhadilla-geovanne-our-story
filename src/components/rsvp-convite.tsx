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
  const responder = useServerFn(responderRsvp);

  async function enviar(status: "confirmado" | "nao_comparecera") {
    setErro(null);
    setEnviando(status);
    try {
      const res = await responder({ data: { codigo: convidado.codigo, status } });
      if (res.ok) setConvidado(res.convidado);
      else setErro("Não encontramos este convite.");
    } catch {
      setErro("Não foi possível registrar sua resposta. Tente novamente.");
    } finally {
      setEnviando(null);
    }
  }

  const respondido = convidado.status !== "pendente";

  return (
    <div className="mx-auto max-w-2xl px-6 text-center">
      <p className="text-[11px] tracking-editorial text-muted-foreground uppercase">
        Confirmação de presença
      </p>
      <h1 className="mt-6 font-serif text-4xl text-foreground md:text-5xl">
        Olá, {convidado.nome}.
      </h1>
      <div className="rule-gold mx-auto my-8" />

      {!respondido && (
        <p className="text-[15px] leading-relaxed text-muted-foreground">
          Será uma alegria ter você conosco para celebrar esse momento tão especial.
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
          {enviando === "confirmado" ? "Registrando…" : "Confirmar minha presença"}
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
          {enviando === "nao_comparecera" ? "Registrando…" : "Não poderei comparecer"}
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
