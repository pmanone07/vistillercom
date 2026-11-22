"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, CreditCard, LayoutDashboard, LogOut, Plus, Settings, ShieldCheck } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { signOut } from "../(auth)/actions";

/** Toppmenyen i dashbordet: Oversikt, Nytt arrangement, Innstillinger-meny og Logg ut. */
export function DashboardNav() {
  const pathname = usePathname();
  const onOverview = pathname === "/dashboard" || pathname.startsWith("/dashboard/events/");
  const inSettings = pathname.startsWith("/dashboard/innstillinger") || pathname.startsWith("/dashboard/medlemskap");
  const active = "bg-muted text-foreground";

  return (
    <nav aria-label="Dashbord" className="flex items-center gap-1">
      <Link
        href="/dashboard"
        aria-current={pathname === "/dashboard" ? "page" : undefined}
        className={cn(buttonVariants({ variant: "ghost", size: "lg" }), onOverview && active)}
      >
        <LayoutDashboard /> <span className="max-sm:sr-only">Oversikt</span>
      </Link>

      <Link href="/dashboard/events/new" className={buttonVariants({ size: "lg" })}>
        <Plus /> <span className="max-sm:sr-only">Nytt arrangement</span>
      </Link>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="ghost" size="lg" className={cn(inSettings && active)} />}
          aria-label="Innstillinger"
        >
          <Settings /> <span className="max-md:sr-only">Innstillinger</span>
          <ChevronDown className="max-md:hidden" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuItem
            render={<Link href="/dashboard/innstillinger" />}
            className={cn("h-10 px-2.5 text-base sm:h-9 sm:text-sm", pathname.startsWith("/dashboard/innstillinger") && active)}
          >
            <Settings /> Innstillinger
          </DropdownMenuItem>
          <DropdownMenuItem
            render={<Link href="/dashboard/medlemskap" />}
            className={cn("h-10 px-2.5 text-base sm:h-9 sm:text-sm", pathname.startsWith("/dashboard/medlemskap") && active)}
          >
            <CreditCard /> Medlemskap
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem render={<Link href="/personvern" />} className="h-10 px-2.5 text-base sm:h-9 sm:text-sm">
            <ShieldCheck /> Personvern
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <form action={signOut}>
        <Button type="submit" variant="ghost" size="lg" aria-label="Logg ut">
          <LogOut /> <span className="max-md:sr-only">Logg ut</span>
        </Button>
      </form>
    </nav>
  );
}
