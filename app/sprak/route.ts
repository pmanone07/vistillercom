import { NextResponse, type NextRequest } from "next/server";
import { safeNext } from "@/lib/auth";
import { LANG_COOKIE, isAuthLang } from "@/lib/auth-i18n";

// Lagrer språkvalget (fra forsiden eller språkknappen på innloggingssidene) og
// sender brukeren videre. Valget styrer hvilken innlogging proxy.ts sender til.
export function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const lang = searchParams.get("lang");
  const target = new URL(safeNext(searchParams.get("to"), "/"), request.nextUrl.origin);
  const response = NextResponse.redirect(target);
  if (isAuthLang(lang)) {
    response.cookies.set(LANG_COOKIE, lang, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
      secure: request.nextUrl.protocol === "https:",
    });
  }
  return response;
}
