"use client";

import { useSettings } from "@/components/providers/SettingsProvider";
import { usePathname } from "next/navigation";

export function GlobalBanner() {
  const { banner } = useSettings();
  const pathname = usePathname();

  if (!banner?.active || !banner.text) return null;
  if (!pathname || pathname.startsWith("/admin")) return null;

  return (
    // role="status" (inte "banner" — det är ett landmärke för sidhuvud).
    // Default-färgen är AA-säker med vit text; admin-valda färger ska vara mörka.
    <div
      className="py-2 text-sm text-center text-white"
      style={{ backgroundColor: banner.color ?? "#1D4ED8" }}
      role="status"
    >
      {banner.text}
    </div>
  );
}
