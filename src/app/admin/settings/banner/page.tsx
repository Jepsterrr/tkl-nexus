import type { Metadata } from "next";
import { BannerForm } from "@/components/admin/settings/BannerForm";

export const metadata: Metadata = { title: "Banner — TKL Admin" };

export default function BannerSettingsPage() {
  return <BannerForm />;
}
