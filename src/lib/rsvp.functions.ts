import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type GuestMemberPublic = {
  id: string;
  nome: string;
  confirmado: boolean;
};

export type GuestPublic = {
  codigo: string;
  nome: string;
  grupo: string | null;
  max_pessoas: number;
  status: "pendente" | "confirmado" | "nao_comparecera";
  data_confirmacao: string | null;
  membros: GuestMemberPublic[];
};

const SELECT = "codigo, nome, grupo, max_pessoas, status, data_confirmacao";

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
  presentes: z.array(z.string().uuid()).max(20).default([]),
});

function initialDoSobrenome(nome: string) {
  const partes = nome.trim().split(/\s+/);
  const ultimo = partes.length > 1 ? partes[partes.length - 1]! : partes[0]!;
  return `${ultimo.charAt(0).toUpperCase()}.`;
}

async function carregarConvidado(codigo: string): Promise<GuestPublic | null> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: row } = await supabaseAdmin
    .from("guests")
    .select(`${SELECT}, guest_members(id, nome, confirmado, ordem)`)
    .eq("codigo", codigo)
    .maybeSingle();
  if (!row) return null;
  const { guest_members, ...guest } = row as any;
  return {
    ...guest,
    membros: (guest_members ?? [])
      .sort((a: any, b: any) => a.ordem - b.ordem)
      .map((m: any) => ({ id: m.id, nome: m.nome, confirmado: m.confirmado })),
  } as GuestPublic;
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
      .select("codigo, nome")
      .ilike("nome", nome)
      .limit(5);

    if (error) throw new Error("Não foi possível concluir a busca agora.");
    if (!rows || rows.length === 0) return { resultado: "nao_encontrado" as const };
    if (rows.length === 1) {
      const convidado = await carregarConvidado(rows[0]!.codigo);
      if (!convidado) return { resultado: "nao_encontrado" as const };
      return { resultado: "encontrado" as const, convidado };
    }
    return {
      resultado: "ambiguo" as const,
      opcoes: rows.map((r) => ({ codigo: r.codigo, dica: initialDoSobrenome(r.nome) })),
    };
  });

export const obterConvidado = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => codigoSchema.parse(data))
  .handler(async ({ data }) => {
    const convidado = await carregarConvidado(data.codigo);
    if (!convidado) return { encontrado: false as const };
    return { encontrado: true as const, convidado };
  });

/** O convidado só altera o próprio status e o dos acompanhantes do seu convite. */
export const responderRsvp = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => respostaSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("guests")
      .update({ status: data.status, data_confirmacao: new Date().toISOString() })
      .eq("codigo", data.codigo)
      .select("id, codigo")
      .maybeSingle();

    if (error) throw new Error("Não foi possível registrar sua resposta agora.");
    if (!row) return { ok: false as const };

    const { data: membros } = await supabaseAdmin
      .from("guest_members")
      .select("id")
      .eq("guest_id", row.id);

    for (const m of membros ?? []) {
      const confirmado = data.status === "confirmado" && data.presentes.includes(m.id);
      await supabaseAdmin
        .from("guest_members")
        .update({ confirmado, respondido: true })
        .eq("id", m.id);
    }

    const convidado = await carregarConvidado(row.codigo);
    if (!convidado) return { ok: false as const };
    return { ok: true as const, convidado };
  });
