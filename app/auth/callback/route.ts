import { NextResponse, type NextRequest } from "next/server";
import { safeNext } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

// Lenken i bekreftelses-e-posten lander her. Bytter koden mot en økt.
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const code = url.searchParams.get("code");
  const target = url.clone();
  target.search = "";

  if (code && isSupabaseConfigured) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      target.pathname = safeNext(url.searchParams.get("next"));
      return NextResponse.redirect(target);
    }
  }
  target.pathname = "/login";
  return NextResponse.redirect(target);
}
