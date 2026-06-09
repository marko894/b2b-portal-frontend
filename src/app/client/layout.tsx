'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getUserRole } from '@/lib/auth';
import { CartProvider } from '@/context/CartContext';
import ClientSidebar from '@/components/ClientSidebar';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isAuthenticated() || getUserRole() !== 'CLIENT') {
      router.replace('/login');
    } else {
      setReady(true);
    }
  }, [router]);

  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <CartProvider>
      <div className="flex h-screen bg-white">
        <ClientSidebar />
        <main className="flex-1 overflow-auto p-8 bg-gray-50">{children}</main>
      </div>
    </CartProvider>
  );
}
