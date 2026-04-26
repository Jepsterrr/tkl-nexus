import type { Metadata } from "next";
import { TimelineList } from "@/components/admin/settings/TimelineList";

export const metadata: Metadata = { title: "Tidslinje — TKL Admin" };

export default function TimelineSettingsPage() {
  return <TimelineList />;
}
