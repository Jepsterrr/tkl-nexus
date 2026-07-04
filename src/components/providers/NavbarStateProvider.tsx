'use client';

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

interface NavbarStateContextValue {
  isDrawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
}

const NavbarStateContext = createContext<NavbarStateContextValue | null>(null);

export function NavbarStateProvider({ children }: { children: ReactNode }) {
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  // Memoiserat värde — annars omrenderas alla konsumenter vid varje render
  const value = useMemo(() => ({ isDrawerOpen, setDrawerOpen }), [isDrawerOpen]);
  return (
    <NavbarStateContext.Provider value={value}>
      {children}
    </NavbarStateContext.Provider>
  );
}

export function useNavbarState(): NavbarStateContextValue {
  const ctx = useContext(NavbarStateContext);
  if (!ctx) throw new Error('useNavbarState must be used within NavbarStateProvider');
  return ctx;
}
