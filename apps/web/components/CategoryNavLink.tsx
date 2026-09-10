"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function CategoryNavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  return <Link className="nav-category" href={href} aria-current={pathname === href || pathname.startsWith(`${href}/`) ? "page" : undefined}>{children}</Link>;
}
