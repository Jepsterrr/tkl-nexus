import { useState, useEffect } from 'react';

export function useImageLoad(url: string | null): boolean {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (!url) return;
    setLoaded(false);
    const img = new Image();
    img.onload = () => setLoaded(true);
    img.src = url;
    return () => { img.onload = null; };
  }, [url]);
  return loaded;
}
