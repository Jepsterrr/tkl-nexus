"use client";

import { useSettings } from "@/components/providers/SettingsProvider";
import { usePathname } from "next/navigation";

export function GlobalBanner() {
  const { banner } = useSettings();
  const pathname = usePathname();

  if (!banner?.active || !banner.text) return null;
  if (pathname.startsWith("/admin")) return null;

  return (
    <div
      className="py-2 text-sm text-center text-white"
      style={{ backgroundColor: banner.color ?? "#3B82F6" }}
      role="banner"
    >
      {banner.text}
    </div>
  );
}
