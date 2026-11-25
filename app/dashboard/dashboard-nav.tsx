"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, CreditCard, Languages, LayoutDashboard, LogOut, Plus, Settings, ShieldCheck } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLang, useT } from "@/components/i18n-provider";
import { chooseLangHref, PATHS } from "@/lib/i18n";
import { showPricing } from "@/lib/membership";
import { cn } from "@/lib/utils";
import { signOut } from "../(auth)/actions";

/** Toppmenyen i dashbordet: Oversikt, Nytt arrangement, Innstillinger-meny og Logg ut. */
export function DashboardNav() {
  const pathname = usePathname();
  const lang = useLang();
  const t = useT().nav;
  const onOverview = pathname === "/dashboard" || pathname.startsWith("/dashboard/events/");
  const inSettings = pathname.startsWith("/dashboard/innstillinger") || pathname.startsWith("/dashboard/medlemskap");
  const active = "bg-muted text-foreground";
  const item = "h-10 px-2.5 text-base sm:h-9 sm:text-sm";
  const other = lang === "en" ? "nb" : "en";

  return (
    <nav aria-label={t.label} className="flex items-center gap-1">
      <Link
        href="/dashboard"
        aria-current={pathname === "/dashboard" ? "page" : undefined}
        className={cn(buttonVariants({ variant: "ghost", size: "lg" }), onOverview && active)}
      >
        <LayoutDashboard /> <span className="max-sm:sr-only">{t.overview}</span>
      </Link>

      <Link href="/dashboard/events/new" className={buttonVariants({ size: "lg" })}>
        <Plus /> <span className="max-sm:sr-only">{t.newEvent}</span>
      </Link>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="ghost" size="lg" className={cn(inSettings && active)} />}
          aria-label={t.settings}
        >
          <Settings /> <span className="max-md:sr-only">{t.settings}</span>
          <ChevronDown className="max-md:hidden" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuItem
            render={<Link href="/dashboard/innstillinger" />}
            className={cn(item, pathname.startsWith("/dashboard/innstillinger") && active)}
          >
            <Settings /> {t.settings}
          </DropdownMenuItem>
          {showPricing && (
            <DropdownMenuItem
              render={<Link href="/dashboard/medlemskap" />}
              className={cn(item, pathname.startsWith("/dashboard/medlemskap") && active)}
            >
              <CreditCard /> {t.membership}
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem render={<Link href={PATHS[lang].privacy} />} className={item}>
            <ShieldCheck /> {t.privacy}
          </DropdownMenuItem>
          {/* Bytter språk og kommer tilbake til samme side. */}
          <DropdownMenuItem
            render={<a href={chooseLangHref(other, pathname)} lang={other} hrefLang={other} />}
            className={item}
          >
            <Languages /> {other === "en" ? "English" : "Norsk"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <form action={signOut}>
        <Button type="submit" variant="ghost" size="lg" aria-label={t.signOut}>
          <LogOut /> <span className="max-md:sr-only">{t.signOut}</span>
        </Button>
      </form>
    </nav>
  );
}
