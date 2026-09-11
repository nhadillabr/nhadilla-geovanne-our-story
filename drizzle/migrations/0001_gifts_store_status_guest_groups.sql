-- Presentes: loja e status de compra
ALTER TABLE public.gifts ADD COLUMN IF NOT EXISTS loja text;
DO $$ BEGIN
  CREATE TYPE public.gift_status AS ENUM ('disponivel', 'reservado', 'oculto');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
ALTER TABLE public.gifts ADD COLUMN IF NOT EXISTS status public.gift_status NOT NULL DEFAULT 'disponivel';

-- Convidados: grupo/família e quantidade de pessoas do convite
ALTER TABLE public.guests ADD COLUMN IF NOT EXISTS grupo text;
ALTER TABLE public.guests ADD COLUMN IF NOT EXISTS max_pessoas integer NOT NULL DEFAULT 1;

-- Acompanhantes do convite
CREATE TABLE IF NOT EXISTS public.guest_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id uuid NOT NULL REFERENCES public.guests(id) ON DELETE CASCADE,
  nome text NOT NULL,
  confirmado boolean NOT NULL DEFAULT false,
  respondido boolean NOT NULL DEFAULT false,
  ordem integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.guest_members TO authenticated;
GRANT ALL ON public.guest_members TO service_role;

ALTER TABLE public.guest_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage guest members"
  ON public.guest_members FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS guest_members_guest_id_idx ON public.guest_members(guest_id);

CREATE TRIGGER guest_members_touch
  BEFORE UPDATE ON public.guest_members
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();