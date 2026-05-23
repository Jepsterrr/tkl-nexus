import type { Metadata } from 'next';
import { ProductForm } from '@/components/admin/products/ProductForm';

export const metadata: Metadata = { title: 'Ny produkt — TKL Admin' };

export default function NewProductPage() {
  return <ProductForm />;
}
