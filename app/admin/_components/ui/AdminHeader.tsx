"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface NavItem {
  readonly href: string;
  readonly label: string;
}

const NAV: ReadonlyArray<NavItem> = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/posts", label: "Posts" },
  { href: "/admin/team", label: "Team" },
];

interface AdminHeaderProps {
  readonly showTeam?: boolean;
  readonly rightSlot: ReactNode;
}

function isActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminHeader({ showTeam = true, rightSlot }: AdminHeaderProps) {
  const pathname = usePathname() ?? "";
  const items = showTeam ? NAV : NAV.filter((n) => n.href !== "/admin/team");

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex items-center justify-between gap-6 px-12 py-4",
        "border-b border-[#2a2a2a]",
        "bg-background/85 backdrop-blur-md supports-[backdrop-filter]:bg-background/70",
      )}
    >
      <Link href="/admin" className="flex items-center gap-4 shrink-0">
        <span className="text-[13px] tracking-[0.06em] text-foreground">
          214Archives Studio
        </span>
        <span className="text-[11px] tracking-[0.15em] text-[#666]">·</span>
        <span className="text-[11px] uppercase tracking-[0.2em] text-muted">
          Admin
        </span>
      </Link>

      <nav className="flex gap-7">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "text-[13px] tracking-[0.05em] transition-colors duration-200 ease-out",
              isActive(pathname, item.href)
                ? "text-foreground"
                : "text-muted hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-5 shrink-0">{rightSlot}</div>
    </header>
  );
}
