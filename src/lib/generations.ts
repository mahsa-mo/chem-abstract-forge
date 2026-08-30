import { supabase } from "@/integrations/supabase/client";

/**
 * Every generated image — originals and regenerations — gets its own permanent
 * row in `generations` plus its own file in the `abstracts` storage bucket.
 * Nothing here ever deletes a row or a file.
 */
export const REGEN_LIMIT = 3;

export type GenerationRow = {
  id: string;
  user_id: string;
  parent_generation_id: string | null;
  title: string;
  source_text: string | null;
  image_path: string | null;
  created_at: string;
};

async function uploadImage(userId: string, dataUrl: string): Promise<string | null> {
  const blob = await (await fetch(dataUrl)).blob();
  const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.png`;
  const { error } = await supabase.storage
    .from("abstracts")
    .upload(path, blob, { contentType: "image/png" });
  return error ? null : path;
}

/**
 * Server-side enforced create. The `create_generation` database function does an
 * atomic locked check-and-insert, so it — not the UI — is the real limit.
 */
export async function createGeneration(opts: {
  userId: string;
  dataUrl: string;
  text: string;
  parentId?: string | null;
}): Promise<GenerationRow> {
  const imagePath = await uploadImage(opts.userId, opts.dataUrl);
  const { data, error } = await supabase.rpc("create_generation", {
    p_title: opts.text.trim().slice(0, 70),
    p_source_text: opts.text.trim().slice(0, 4000),
    ...(imagePath ? { p_image_path: imagePath } : {}),
    ...(opts.parentId ? { p_parent_generation_id: opts.parentId } : {}),
  });
  if (error) throw new Error(error.message);
  return data as unknown as GenerationRow;
}

export async function countRegenerations(parentId: string): Promise<number> {
  const { count } = await supabase
    .from("generations")
    .select("id", { count: "exact", head: true })
    .eq("parent_generation_id", parentId);
  return count ?? 0;
}

/** Latest original generation for the user, used to restore state after refresh. */
export async function loadLatestOriginal(
  userId: string,
): Promise<{ generation: GenerationRow; regenUsed: number; imageUrl: string | null } | null> {
  const { data } = await supabase
    .from("generations")
    .select("id, user_id, parent_generation_id, title, source_text, image_path, created_at")
    .eq("user_id", userId)
    .is("parent_generation_id", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!data) return null;
  const generation = data as GenerationRow;
  const regenUsed = await countRegenerations(generation.id);

  let imageUrl: string | null = null;
  if (generation.image_path) {
    const latestChild = await supabase
      .from("generations")
      .select("image_path")
      .eq("parent_generation_id", generation.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    const path = (latestChild.data?.image_path as string | null) ?? generation.image_path;
    const signed = await supabase.storage.from("abstracts").createSignedUrl(path, 60 * 60);
    imageUrl = signed.data?.signedUrl ?? null;
  }
  return { generation, regenUsed, imageUrl };
}

export function isRegenLimitError(message: string): boolean {
  return message.includes("regenerate_limit_reached");
}
