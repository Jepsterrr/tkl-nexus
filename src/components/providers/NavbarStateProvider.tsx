'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

interface NavbarStateContextValue {
  isDrawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
}

const NavbarStateContext = createContext<NavbarStateContextValue | null>(null);

export function NavbarStateProvider({ children }: { children: ReactNode }) {
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  return (
    <NavbarStateContext.Provider value={{ isDrawerOpen, setDrawerOpen }}>
      {children}
    </NavbarStateContext.Provider>
  );
}

export function useNavbarState(): NavbarStateContextValue {
  const ctx = useContext(NavbarStateContext);
  if (!ctx) throw new Error('useNavbarState must be used within NavbarStateProvider');
  return ctx;
}
