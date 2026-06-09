'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/axios';
import { saveAuth } from '@/lib/auth';
import { AuthResponse } from '@/types';

const INITIAL = {
  firstName: '', lastName: '', email: '', password: '',
  companyName: '', address: '', city: '', pib: '', phone: '',
};

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState(INITIAL);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function set(key: keyof typeof INITIAL, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post<AuthResponse>('/auth/register', form);
      saveAuth(data);
      router.replace('/client');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || 'Greška pri registraciji');
    } finally {
      setLoading(false);
    }
  }

  const inputCls = 'w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300';
  const labelCls = 'block text-xs font-medium text-slate-600 mb-1';
  const sectionCls = 'text-xs font-semibold text-slate-400 uppercase tracking-wider';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 w-full max-w-lg p-8">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-slate-800">Registracija</h1>
          <p className="text-slate-500 text-sm mt-1">Kreirajte nalog i firmu</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <p className={sectionCls}>Lični podaci</p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Ime</label>
              <input required type="text" placeholder="Marko" value={form.firstName}
                onChange={(e) => set('firstName', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Prezime</label>
              <input required type="text" placeholder="Marković" value={form.lastName}
                onChange={(e) => set('lastName', e.target.value)} className={inputCls} />
            </div>
          </div>

          <div>
            <label className={labelCls}>Email</label>
            <input required type="email" placeholder="marko@firma.com" value={form.email}
              onChange={(e) => set('email', e.target.value)} className={inputCls} />
          </div>

          <div>
            <label className={labelCls}>Lozinka</label>
            <input required type="password" placeholder="••••••••" value={form.password}
              onChange={(e) => set('password', e.target.value)} className={inputCls} />
          </div>

          <p className={`${sectionCls} pt-2`}>Podaci o firmi</p>

          <div>
            <label className={labelCls}>Naziv firme</label>
            <input required type="text" placeholder="D.O.O. Primer" value={form.companyName}
              onChange={(e) => set('companyName', e.target.value)} className={inputCls} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Adresa</label>
              <input required type="text" placeholder="Kneza Miloša 1" value={form.address}
                onChange={(e) => set('address', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Grad</label>
              <input required type="text" placeholder="Beograd" value={form.city}
                onChange={(e) => set('city', e.target.value)} className={inputCls} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>PIB</label>
              <input required type="text" placeholder="123456789" value={form.pib}
                onChange={(e) => set('pib', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Telefon</label>
              <input required type="text" placeholder="+381 11 123 4567" value={form.phone}
                onChange={(e) => set('phone', e.target.value)} className={inputCls} />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm rounded-lg px-3 py-2">{error}</div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button type="submit" disabled={loading}
              className="text-sm font-medium px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50 transition-colors">
              {loading ? 'Registracija...' : 'Registruj se'}
            </button>
          </div>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Već imate nalog?{' '}
          <Link href="/login" className="text-blue-500 hover:text-blue-600 font-medium">Prijavite se</Link>
        </p>
      </div>
    </div>
  );
}
