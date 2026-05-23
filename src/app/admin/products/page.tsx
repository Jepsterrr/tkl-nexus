import type { Metadata } from 'next';
import { ProductsContent } from './ProductsContent';

export const metadata: Metadata = { title: 'Produktportfölj — TKL Admin' };

export default function ProductsAdminPage() {
  return <ProductsContent />;
}
