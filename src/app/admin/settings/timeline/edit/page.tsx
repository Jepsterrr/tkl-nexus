import { Suspense } from 'react';
import type { Metadata } from "next";
import { TimelineForm } from "@/components/admin/settings/TimelineForm";

export const metadata: Metadata = { title: "Redigera tidslinjpost — TKL Admin" };

export default function EditTimelinePage() {
  return (
    <Suspense>
      <TimelineForm mode="edit" />
    </Suspense>
  );
}
