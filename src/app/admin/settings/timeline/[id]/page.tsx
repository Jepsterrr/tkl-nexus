import type { Metadata } from "next";
import { TimelineForm } from "@/components/admin/settings/TimelineForm";

export const dynamic = "force-static";
export const metadata: Metadata = {
  title: "Redigera tidslinjpost — TKL Admin",
};

export default function EditTimelinePage() {
  return <TimelineForm mode="edit" />;
}
