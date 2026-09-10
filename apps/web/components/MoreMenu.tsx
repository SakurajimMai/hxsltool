"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useEffect, useRef } from "react";

type MoreMenuItem = { href: string; label: string };

export function MoreMenu({ label, items }: { label: string; items: MoreMenuItem[] }) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const close = () => {
    const details = detailsRef.current;
    if (details) details.open = false;
  };

  useEffect(() => {
    const details = detailsRef.current;
    if (!details) return;
    const onPointerDown = (event: PointerEvent) => {
      if (details.open && event.target instanceof Node && !details.contains(event.target)) details.open = false;
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && details.open) {
        details.open = false;
        details.querySelector("summary")?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return <details className="more-menu" ref={detailsRef}>
    <summary>{label}<ChevronDown size={13} aria-hidden="true" /></summary>
    <div className="more-menu-panel">{items.map((item) => <Link href={item.href} key={item.href} onClick={close}>{item.label}</Link>)}</div>
  </details>;
}
