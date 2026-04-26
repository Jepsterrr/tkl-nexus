import type { Metadata } from "next";
import { TimelineForm } from "@/components/admin/settings/TimelineForm";

export const metadata: Metadata = { title: "Ny tidslinjeppost — TKL Admin" };

export default function NewTimelinePage() {
  return <TimelineForm mode="create" />;
}
