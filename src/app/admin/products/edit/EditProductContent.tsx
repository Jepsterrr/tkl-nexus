'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProductForm } from '@/components/admin/products/ProductForm';
import { getProductById } from '@/lib/services/products';
import type { TKLProduct } from '@/lib/schemas/product';

export function EditProductContent() {
  const params = useSearchParams();
  const id = params.get('id') ?? '';
  const [product, setProduct] = useState<TKLProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return; // saknat id hanteras direkt i render
    getProductById(id)
      .then((p) => { setProduct(p); setLoading(false); if (!p) setError(true); })
      .catch(() => { setError(true); setLoading(false); });
  }, [id]);

  if (loading && id) return <p className="p-6 text-sm text-[oklch(55%_0.02_265)]">Laddar…</p>;
  if (!id || error || !product) return <p className="p-6 text-sm text-red-400">Produkten hittades inte.</p>;

  return <ProductForm initial={product} />;
}
