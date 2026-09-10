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
};

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
    .select("id, nome, descricao, preco, imagem, categoria, url")
    .eq("ativo", true)
    .order("ordem", { ascending: true })
    .order("nome", { ascending: true });

  if (error) return [] as Gift[];
  return (data ?? []) as Gift[];
});
