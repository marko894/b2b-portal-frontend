'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { clearAuth, getUserEmail } from '@/lib/auth';
import { useCart } from '@/context/CartContext';

const NAV = [
  { href: '/client/catalog', label: 'Katalog' },
  { href: '/client/orders',  label: 'Moje porudžbenice' },
];

export default function ClientSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const { totalItems } = useCart();

  useEffect(() => {
    setEmail(getUserEmail());
  }, []);

  function logout() {
    clearAuth();
    router.push('/login');
  }

  return (
    <aside className="w-56 flex flex-col bg-gray-50 border-r border-gray-200 h-screen sticky top-0">
      <div className="px-5 py-5 border-b border-gray-200">
        <span className="text-base font-semibold text-slate-800">B2B Portal</span>
        <span className="block text-xs text-slate-400 mt-0.5">Klijent</span>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-0.5">
        {NAV.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-slate-600 hover:bg-gray-100 hover:text-slate-800'
              }`}
            >
              <span>{item.label}</span>
            </Link>
          );
        })}

        <Link
          href="/client/cart"
          className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            pathname.startsWith('/client/cart')
              ? 'bg-blue-100 text-blue-700'
              : 'text-slate-600 hover:bg-gray-100 hover:text-slate-800'
          }`}
        >
          <span>Korpa</span>
          {totalItems > 0 && (
            <span className="bg-blue-500 text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </Link>
      </nav>

      <div className="px-3 py-4 border-t border-gray-200">
        <div className="px-3 py-2 mb-1">
          <p className="text-xs text-slate-400 truncate">{email}</p>
        </div>
        <button
          onClick={logout}
          className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-500 hover:bg-gray-100 hover:text-slate-700 transition-colors"
        >
          Odjava
        </button>
      </div>
    </aside>
  );
}
