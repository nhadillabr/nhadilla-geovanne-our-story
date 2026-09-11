import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export type AdminMember = {
  id: string;
  nome: string;
  confirmado: boolean;
  respondido: boolean;
  ordem: number;
};

export type AdminGuest = {
  id: string;
  nome: string;
  codigo: string;
  grupo: string | null;
  max_pessoas: number;
  status: "pendente" | "confirmado" | "nao_comparecera";
  data_confirmacao: string | null;
  observacoes: string | null;
  membros: AdminMember[];
};

export type AdminGift = {
  id: string;
  nome: string;
  descricao: string | null;
  preco: number | null;
  imagem: string | null;
  imagemUrl: string | null;
  categoria: string;
  url: string | null;
  loja: string | null;
  ativo: boolean;
  status: "disponivel" | "reservado" | "oculto";
  ordem: number;
};

type Ctx = { supabase: any; userId: string };

async function assertAdmin(context: Ctx) {
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

/* ------------------------------- Convidados ------------------------------- */

export const listarConvidados = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("guests")
      .select(
        "id, nome, codigo, grupo, max_pessoas, status, data_confirmacao, observacoes, guest_members(id, nome, confirmado, respondido, ordem)",
      )
      .order("nome", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []).map((g: any) => ({
      ...g,
      membros: (g.guest_members ?? []).sort((a: AdminMember, b: AdminMember) => a.ordem - b.ordem),
    })) as AdminGuest[];
  });

const guestInput = z.object({
  nome: z.string().trim().min(2).max(120),
  grupo: z.string().trim().max(120).nullable().optional(),
  max_pessoas: z.number().int().min(1).max(20).default(1),
  status: z.enum(["pendente", "confirmado", "nao_comparecera"]).default("pendente"),
  observacoes: z.string().trim().max(500).nullable().optional(),
  membros: z.array(z.string().trim().min(2).max(120)).max(20).default([]),
});

async function sincronizarMembros(context: Ctx, guestId: string, membros: string[]) {
  await context.supabase.from("guest_members").delete().eq("guest_id", guestId);
  if (membros.length === 0) return;
  const { error } = await context.supabase.from("guest_members").insert(
    membros.map((nome, i) => ({
      guest_id: guestId,
      nome,
      ordem: i,
    })),
  );
  if (error) throw new Error(error.message);
}

export const criarConvidado = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => guestInput.parse(data))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { data: novo, error } = await context.supabase
      .from("guests")
      .insert({
        nome: data.nome,
        grupo: data.grupo || null,
        max_pessoas: data.max_pessoas,
        status: data.status,
        observacoes: data.observacoes ?? null,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    await sincronizarMembros(context, novo.id, data.membros);
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
        grupo: data.grupo || null,
        max_pessoas: data.max_pessoas,
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
    await sincronizarMembros(context, data.id, data.membros);
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

/* -------------------------------- Presentes ------------------------------- */

export const listarPresentesAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("gifts")
      .select("id, nome, descricao, preco, imagem, categoria, url, loja, ativo, status, ordem")
      .order("ordem", { ascending: true })
      .order("nome", { ascending: true });
    if (error) throw new Error(error.message);

    const itens = (data ?? []) as AdminGift[];
    const { assinarImagens } = await import("./gifts.functions");
    const comUrl = await assinarImagens(itens.map((g) => ({ ...g })));
    return itens.map((g, i) => ({ ...g, imagemUrl: comUrl[i]?.imagem ?? null })) as AdminGift[];
  });

const giftInput = z.object({
  nome: z.string().trim().min(2).max(140),
  descricao: z.string().trim().max(400).nullable().optional(),
  preco: z.number().nonnegative().nullable().optional(),
  imagem: z.string().trim().max(600).nullable().optional(),
  categoria: z.string().trim().min(2).max(60),
  loja: z.string().trim().max(80).nullable().optional(),
  url: z.string().trim().url().max(600).nullable().optional().or(z.literal("")),
  ativo: z.boolean().default(true),
  status: z.enum(["disponivel", "reservado", "oculto"]).default("disponivel"),
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
      loja: data.loja || null,
      url: data.url || null,
      ativo: data.ativo,
      status: data.status,
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
    const { data: atual } = await context.supabase
      .from("gifts")
      .select("imagem")
      .eq("id", data.id)
      .maybeSingle();
    const { error } = await context.supabase.from("gifts").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    if (atual?.imagem && !/^https?:\/\//i.test(atual.imagem)) {
      await context.supabase.storage.from("gift-images").remove([atual.imagem]);
    }
    return { ok: true };
  });

/** Remove uma imagem enviada ao storage (usado ao trocar/remover a foto). */
export const removerImagemPresente = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ path: z.string().min(3).max(300) }).parse(data))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    if (/^https?:\/\//i.test(data.path)) return { ok: true };
    await context.supabase.storage.from("gift-images").remove([data.path]);
    return { ok: true };
  });

/** URL temporária para pré-visualizar uma imagem recém enviada. */
export const urlImagemPresente = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ path: z.string().min(3).max(300) }).parse(data))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    if (/^https?:\/\//i.test(data.path)) return { url: data.path };
    const { data: signed } = await context.supabase.storage
      .from("gift-images")
      .createSignedUrl(data.path, 60 * 60);
    return { url: signed?.signedUrl ?? null };
  });
