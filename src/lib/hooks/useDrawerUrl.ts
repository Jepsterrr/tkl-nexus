import { useCallback } from 'react';

/**
 * Minimal hook för URL-synk vid drawer-navigering.
 * Hanterar INTE initial URL-check eller popstate - det görs direkt
 * i respektive Content-komponent för korrekt beroende på lokal state.
 */

export function useDrawerUrl(paramKey = 'id') {
  const pushId = useCallback(
    (id: string) => {
      const url = new URL(window.location.href);
      url.searchParams.set(paramKey, id);
      history.pushState({ [paramKey]: id }, '', url.toString());
    },
    [paramKey],
  );

  const clearId = useCallback(() => {
    const url = new URL(window.location.href);
    url.searchParams.delete(paramKey);
    history.replaceState({}, '', url.toString());
  }, [paramKey]);

  return { pushId, clearId };
}
