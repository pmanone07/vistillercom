// Bare offentlige verdier. Appen bruker ingen hemmelig (service role) nøkkel.
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://vistiller.com").replace(/\/$/, "");
