import type { Metadata } from 'next';
import { ContactForm } from '@/components/admin/settings/ContactForm';

export const metadata: Metadata = { title: 'Kontakt — TKL Admin' };

export default function ContactSettingsPage() {
  return <ContactForm />;
}
