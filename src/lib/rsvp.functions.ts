import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type GuestPublic = {
  codigo: string;
  nome: string;
  status: "pendente" | "confirmado" | "nao_comparecera";
  data_confirmacao: string | null;
};

const nomeSchema = z.object({
  nome: z.string().trim().min(3, "Informe seu nome completo.").max(120),
});

const codigoSchema = z.object({
  codigo: z
    .string()
    .trim()
    .regex(/^[a-f0-9]{6,64}$/i, "Convite inválido."),
});

const respostaSchema = codigoSchema.extend({
  status: z.enum(["confirmado", "nao_comparecera"]),
});

function initialDoSobrenome(nome: string) {
  const partes = nome.trim().split(/\s+/);
  const ultimo = partes.length > 1 ? partes[partes.length - 1]! : partes[0]!;
  return `${ultimo.charAt(0).toUpperCase()}.`;
}

/**
 * Busca nominal: apenas o nome completo exato (sem diferenciar maiúsculas)
 * retorna resultado. Nunca devolve lista de convidados.
 */
export const buscarConvidado = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => nomeSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const nome = data.nome.replace(/\s+/g, " ").trim();

    const { data: rows, error } = await supabaseAdmin
      .from("guests")
      .select("codigo, nome, status, data_confirmacao")
      .ilike("nome", nome)
      .limit(5);

    if (error) throw new Error("Não foi possível concluir a busca agora.");
    if (!rows || rows.length === 0) {
      return { resultado: "nao_encontrado" as const };
    }
    if (rows.length === 1) {
      return { resultado: "encontrado" as const, convidado: rows[0] as GuestPublic };
    }
    return {
      resultado: "ambiguo" as const,
      opcoes: rows.map((r) => ({
        codigo: r.codigo,
        dica: initialDoSobrenome(r.nome),
      })),
    };
  });

export const obterConvidado = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => codigoSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("guests")
      .select("codigo, nome, status, data_confirmacao")
      .eq("codigo", data.codigo)
      .maybeSingle();

    if (error) throw new Error("Não foi possível abrir o convite agora.");
    if (!row) return { encontrado: false as const };
    return { encontrado: true as const, convidado: row as GuestPublic };
  });

/** O convidado só altera o próprio status. Nenhum outro campo é aceito. */
export const responderRsvp = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => respostaSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("guests")
      .update({ status: data.status, data_confirmacao: new Date().toISOString() })
      .eq("codigo", data.codigo)
      .select("codigo, nome, status, data_confirmacao")
      .maybeSingle();

    if (error) throw new Error("Não foi possível registrar sua resposta agora.");
    if (!row) return { ok: false as const };
    return { ok: true as const, convidado: row as GuestPublic };
  });
