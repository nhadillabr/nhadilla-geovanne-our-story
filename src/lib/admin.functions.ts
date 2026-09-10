import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export type AdminGuest = {
  id: string;
  nome: string;
  codigo: string;
  status: "pendente" | "confirmado" | "nao_comparecera";
  data_confirmacao: string | null;
  observacoes: string | null;
};

export type AdminGift = {
  id: string;
  nome: string;
  descricao: string | null;
  preco: number | null;
  imagem: string | null;
  categoria: string;
  url: string | null;
  ativo: boolean;
  ordem: number;
};

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error || !data) throw new Error("Acesso restrito.");
}

export const souAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    return { admin: Boolean(data) };
  });

export const listarConvidados = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("guests")
      .select("id, nome, codigo, status, data_confirmacao, observacoes")
      .order("nome", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []) as AdminGuest[];
  });

const guestInput = z.object({
  nome: z.string().trim().min(2).max(120),
  status: z.enum(["pendente", "confirmado", "nao_comparecera"]).default("pendente"),
  observacoes: z.string().trim().max(500).nullable().optional(),
});

export const criarConvidado = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => guestInput.parse(data))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("guests").insert({
      nome: data.nome,
      status: data.status,
      observacoes: data.observacoes ?? null,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const atualizarConvidado = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => guestInput.extend({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { data: atual } = await context.supabase
      .from("guests")
      .select("status, data_confirmacao")
      .eq("id", data.id)
      .maybeSingle();

    const mudouStatus = atual?.status !== data.status;
    const { error } = await context.supabase
      .from("guests")
      .update({
        nome: data.nome,
        status: data.status,
        observacoes: data.observacoes ?? null,
        data_confirmacao:
          data.status === "pendente"
            ? null
            : mudouStatus
              ? new Date().toISOString()
              : (atual?.data_confirmacao ?? new Date().toISOString()),
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const excluirConvidado = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("guests").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listarPresentesAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("gifts")
      .select("id, nome, descricao, preco, imagem, categoria, url, ativo, ordem")
      .order("ordem", { ascending: true })
      .order("nome", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []) as AdminGift[];
  });

const giftInput = z.object({
  nome: z.string().trim().min(2).max(140),
  descricao: z.string().trim().max(400).nullable().optional(),
  preco: z.number().nonnegative().nullable().optional(),
  imagem: z.string().trim().url().max(600).nullable().optional().or(z.literal("")),
  categoria: z.string().trim().min(2).max(60),
  url: z.string().trim().url().max(600).nullable().optional().or(z.literal("")),
  ativo: z.boolean().default(true),
  ordem: z.number().int().default(0),
});

export const salvarPresente = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    giftInput.extend({ id: z.string().uuid().optional() }).parse(data),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const payload = {
      nome: data.nome,
      descricao: data.descricao || null,
      preco: data.preco ?? null,
      imagem: data.imagem || null,
      categoria: data.categoria,
      url: data.url || null,
      ativo: data.ativo,
      ordem: data.ordem,
    };
    const { error } = data.id
      ? await context.supabase.from("gifts").update(payload).eq("id", data.id)
      : await context.supabase.from("gifts").insert(payload);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const excluirPresente = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("gifts").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
