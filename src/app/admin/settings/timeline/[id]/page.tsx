import type { Metadata } from "next";
import { TimelineForm } from "@/components/admin/settings/TimelineForm";

export const metadata: Metadata = {
  title: "Redigera tidslinjeppost — TKL Admin",
};

export default async function EditTimelinePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TimelineForm mode="edit" id={id} />;
}
