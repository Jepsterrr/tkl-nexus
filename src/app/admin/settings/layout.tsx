import { SettingsSidebar } from '@/components/admin/settings/SettingsSidebar';

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row min-h-0 flex-1">
      <SettingsSidebar />
      <div className="flex-1 min-w-0">
        {children}
      </div>
    </div>
  );
}
