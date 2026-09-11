import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export type Gift = {
  id: string;
  nome: string;
  descricao: string | null;
  preco: number | null;
  imagem: string | null;
  categoria: string;
  url: string | null;
  loja: string | null;
  status: "disponivel" | "reservado" | "oculto";
};

/** Imagens enviadas pelo painel ficam no bucket privado e recebem URL assinada. */
export async function assinarImagens<T extends { imagem: string | null }>(itens: T[]) {
  const paths = itens
    .map((i) => i.imagem)
    .filter((v): v is string => Boolean(v) && !/^https?:\/\//i.test(v!));
  if (paths.length === 0) return itens;

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin.storage.from("gift-images").createSignedUrls(paths, 60 * 60);
  const mapa = new Map((data ?? []).map((d) => [d.path, d.signedUrl]));

  return itens.map((i) =>
    i.imagem && mapa.has(i.imagem) ? { ...i, imagem: mapa.get(i.imagem) ?? null } : i,
  );
}

export const listarPresentes = createServerFn({ method: "GET" }).handler(async () => {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  const supabasePublic = createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });

  const { data, error } = await supabasePublic
    .from("gifts")
    .select("id, nome, descricao, preco, imagem, categoria, url, loja, status")
    .eq("ativo", true)
    .neq("status", "oculto")
    .order("ordem", { ascending: true })
    .order("nome", { ascending: true });

  if (error) return [] as Gift[];
  return (await assinarImagens((data ?? []) as Gift[])) as Gift[];
});
