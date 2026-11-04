import type { ReactNode } from 'react';
import ShopShell from '../shop-shell';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <ShopShell>{children}</ShopShell>;
}
