'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { clearAuth, getUserEmail } from '@/lib/auth';

const NAV = [
  { href: '/admin/products', label: 'Proizvodi' },
  { href: '/admin/orders',   label: 'Porudžbenice' },
  { href: '/admin/users',    label: 'Korisnici' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);

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
        <span className="block text-xs text-slate-400 mt-0.5">Admin</span>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-0.5">
        {NAV.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-slate-600 hover:bg-gray-100 hover:text-slate-800'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
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
