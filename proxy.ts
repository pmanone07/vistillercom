import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { AUTH_PATHS, LANG_COOKIE } from "@/lib/auth-i18n";
import { isSupabaseConfigured, supabaseKey, supabaseUrl } from "@/lib/supabase/env";

const AUTH_PAGES = new Set<string>([...Object.values(AUTH_PATHS.nb), ...Object.values(AUTH_PATHS.en)]);

// Fornyer Supabase-økten og sender ikke-innloggede bort fra dashbordet.
// /start er inngangen til appene (Capacitor og PWA): innloggede går rett til
// dashbordet. Andre velger språk første gang (/velg-sprak), og får deretter
// forsiden (norsk) eller den engelske innloggingen.
// Selve tilgangskontrollen ligger i RLS og i requireUser() – dette er bare
// en rask første sjekk.
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  if (!isSupabaseConfigured) {
    return request.nextUrl.pathname === "/start" ? redirectTo(request, "/") : response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options);
      },
    },
  });

  const { data } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;

  // Bare sidevisninger omdirigeres. Server actions (POST) må få svare selv:
  // de sjekker innlogging med requireUser() og sender brukeren til /login på
  // en måte skjemaet forstår. En omdirigering her gir «unexpected response».
  if (request.method !== "GET" && request.method !== "HEAD") return response;

  // Språket brukeren valgte ved første åpning (/velg-sprak). Gjelder bare innlogging og registrering.
  const lang = request.cookies.get(LANG_COOKIE)?.value;

  if (pathname === "/start") {
    if (data.user) return redirectTo(request, "/dashboard");
    if (lang === "en") return redirectTo(request, AUTH_PATHS.en.login);
    return redirectTo(request, lang === "nb" ? "/" : "/velg-sprak");
  }
  if (!data.user && pathname.startsWith("/dashboard")) {
    const url = request.nextUrl.clone();
    url.pathname = lang === "en" ? AUTH_PATHS.en.login : AUTH_PATHS.nb.login;
    url.search = `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }
  if (data.user && AUTH_PAGES.has(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }
  return response;
}

function redirectTo(request: NextRequest, pathname: string) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/start", "/dashboard/:path*", "/login", "/registrer", "/en/login", "/en/register"],
};
