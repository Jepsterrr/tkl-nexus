'use client';

import { createContext, useCallback, useContext, useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';

interface NavbarStateContextValue {
  /** Sant så länge minst en modal yta (drawer/bottom-sheet) håller navbaren dold. */
  isDrawerOpen: boolean;
  setHidden: (key: string, hidden: boolean) => void;
}

const NavbarStateContext = createContext<NavbarStateContextValue | null>(null);

/**
 * Reservtid om AnimatePresence aldrig rapporterar onExitComplete (t.ex. om ytan
 * avmonteras mitt i exit). Längre än drawer-exit (0,28 s) så den normala vägen vinner.
 */
const RELEASE_FALLBACK_MS = 600;

export function NavbarStateProvider({ children }: { children: ReactNode }) {
  // Set i stället för boolean — /career kan ha både filter-sheet och CareerDrawer,
  // och en yta som stängs får inte visa navbaren medan en annan fortfarande är öppen.
  const [hiddenBy, setHiddenBy] = useState<ReadonlySet<string>>(() => new Set());
  const setHidden = useCallback((key: string, hidden: boolean) => {
    setHiddenBy((prev) => {
      if (prev.has(key) === hidden) return prev;
      const next = new Set(prev);
      if (hidden) next.add(key);
      else next.delete(key);
      return next;
    });
  }, []);
  const isDrawerOpen = hiddenBy.size > 0;
  // Memoiserat värde — annars omrenderas alla konsumenter vid varje render
  const value = useMemo(() => ({ isDrawerOpen, setHidden }), [isDrawerOpen, setHidden]);
  return (
    <NavbarStateContext.Provider value={value}>
      {children}
    </NavbarStateContext.Provider>
  );
}

export function useNavbarState(): Pick<NavbarStateContextValue, 'isDrawerOpen'> {
  const ctx = useContext(NavbarStateContext);
  if (!ctx) throw new Error('useNavbarState must be used within NavbarStateProvider');
  return ctx;
}

/**
 * Döljer navbaren medan en modal yta är öppen. Navbaren släpps först när ytans
 * exit-animation är klar — returvärdet ska skickas till `AnimatePresence onExitComplete`.
 * Annars droppar navbaren in samtidigt som overlay/drawer tonar ut, och glasnavbaren
 * (genomskinlig + backdrop-blur över den mörka overlayn) ser ut att ligga bakom den.
 */
export function useHideNavbarWhileOpen(open: boolean): () => void {
  const ctx = useContext(NavbarStateContext);
  if (!ctx) throw new Error('useHideNavbarWhileOpen must be used within NavbarStateProvider');
  const { setHidden } = ctx;
  const key = useId();
  const openRef = useRef(open);

  useEffect(() => {
    openRef.current = open;
    if (open) {
      setHidden(key, true);
      return;
    }
    const t = setTimeout(() => setHidden(key, false), RELEASE_FALLBACK_MS);
    return () => clearTimeout(t);
  }, [open, key, setHidden]);

  // Avmontering (t.ex. navigering bort med öppen drawer) får aldrig lämna navbaren dold
  useEffect(() => () => setHidden(key, false), [key, setHidden]);

  // Ignorera en sen exit om ytan hunnit öppnas igen
  return useCallback(() => {
    if (!openRef.current) setHidden(key, false);
  }, [key, setHidden]);
}
