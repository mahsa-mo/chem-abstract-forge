CREATE TABLE public.generations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  parent_generation_id UUID REFERENCES public.generations(id) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  source_text TEXT,
  image_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.generations TO authenticated;
GRANT ALL ON public.generations TO service_role;

ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own generations" ON public.generations
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own generations" ON public.generations
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own generations" ON public.generations
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX generations_user_created_idx ON public.generations (user_id, created_at DESC);
CREATE INDEX generations_parent_idx ON public.generations (parent_generation_id);
CREATE INDEX generations_user_originals_idx ON public.generations (user_id, created_at DESC)
  WHERE parent_generation_id IS NULL;

CREATE OR REPLACE FUNCTION public.generations_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER generations_updated_at
  BEFORE UPDATE ON public.generations
  FOR EACH ROW EXECUTE FUNCTION public.generations_set_updated_at();

-- Only one level of nesting: a regeneration cannot itself be a parent.
CREATE OR REPLACE FUNCTION public.generations_validate_parent()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  parent_owner UUID;
  parent_parent UUID;
BEGIN
  IF NEW.parent_generation_id IS NOT NULL THEN
    SELECT user_id, parent_generation_id INTO parent_owner, parent_parent
    FROM public.generations WHERE id = NEW.parent_generation_id;
    IF parent_owner IS NULL THEN
      RAISE EXCEPTION 'parent_not_found';
    END IF;
    IF parent_owner <> NEW.user_id THEN
      RAISE EXCEPTION 'parent_owner_mismatch';
    END IF;
    IF parent_parent IS NOT NULL THEN
      RAISE EXCEPTION 'parent_must_be_original';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER generations_validate_parent_trg
  BEFORE INSERT OR UPDATE ON public.generations
  FOR EACH ROW EXECUTE FUNCTION public.generations_validate_parent();

-- Atomic check-and-insert: at most 3 regenerations per original generation.
CREATE OR REPLACE FUNCTION public.create_generation(
  p_title TEXT,
  p_source_text TEXT DEFAULT NULL,
  p_image_path TEXT DEFAULT NULL,
  p_parent_generation_id UUID DEFAULT NULL
)
RETURNS public.generations
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user UUID := auth.uid();
  v_parent_owner UUID;
  v_count INT;
  v_row public.generations;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  IF p_parent_generation_id IS NOT NULL THEN
    -- Row lock serializes concurrent regenerate attempts on the same original.
    SELECT user_id INTO v_parent_owner
    FROM public.generations
    WHERE id = p_parent_generation_id
    FOR UPDATE;

    IF v_parent_owner IS NULL THEN
      RAISE EXCEPTION 'parent_not_found';
    END IF;
    IF v_parent_owner <> v_user THEN
      RAISE EXCEPTION 'forbidden';
    END IF;

    SELECT count(*) INTO v_count
    FROM public.generations
    WHERE parent_generation_id = p_parent_generation_id;

    IF v_count >= 3 THEN
      RAISE EXCEPTION 'regenerate_limit_reached';
    END IF;
  END IF;

  INSERT INTO public.generations (user_id, parent_generation_id, title, source_text, image_path)
  VALUES (v_user, p_parent_generation_id, p_title, p_source_text, p_image_path)
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.create_generation(TEXT, TEXT, TEXT, UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_generation(TEXT, TEXT, TEXT, UUID) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.generations_set_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.generations_validate_parent() FROM PUBLIC, anon, authenticated;