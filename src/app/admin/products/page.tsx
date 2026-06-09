'use client';

import { useState, useEffect, FormEvent } from 'react';
import api from '@/lib/axios';
import Modal from '@/components/Modal';
import { Product, ProductRequest } from '@/types';

const EMPTY: ProductRequest = { name: '', description: '', price: 0, stockQuantity: 0 };

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [selected, setSelected] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductRequest>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get<Product[]>('/api/products');
      setProducts(data);
    } catch {
      // interceptor handles 401; other errors silently degrade
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function openAdd() {
    setForm(EMPTY);
    setError('');
    setModal('add');
  }

  function openEdit(p: Product) {
    setSelected(p);
    setForm({ name: p.name, description: p.description, price: p.price, stockQuantity: p.stockQuantity });
    setError('');
    setModal('edit');
  }

  function closeModal() {
    setModal(null);
    setSelected(null);
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (modal === 'add') {
        await api.post('/api/products', form);
      } else if (selected) {
        await api.put(`/api/products/${selected.id}`, form);
      }
      await load();
      closeModal();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || 'Greška pri čuvanju');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Obrisati proizvod?')) return;
    try {
      await api.delete(`/api/products/${id}`);
      setProducts((p) => p.filter((x) => x.id !== id));
    } catch {
      alert('Greška pri brisanju');
    }
  }

  function set(key: keyof ProductRequest, value: string | number) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-slate-800">Proizvodi</h1>
        <button
          onClick={openAdd}
          className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Dodaj proizvod
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-7 h-7 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-medium text-slate-500">Naziv</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Opis</th>
                <th className="text-right px-4 py-3 font-medium text-slate-500">Cena (RSD)</th>
                <th className="text-right px-4 py-3 font-medium text-slate-500">Lager</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {products.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-slate-400 py-10">
                    Nema proizvoda
                  </td>
                </tr>
              )}
              {products.map((p) => (
                <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-800">{p.name}</td>
                  <td className="px-4 py-3 text-slate-500 max-w-xs truncate">{p.description}</td>
                  <td className="px-4 py-3 text-right text-slate-700">
                    {Number(p.price).toLocaleString('sr-RS')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={p.stockQuantity === 0 ? 'text-red-500' : 'text-slate-700'}>
                      {p.stockQuantity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(p)}
                        className="text-xs text-blue-500 hover:text-blue-600 font-medium"
                      >
                        Izmeni
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="text-xs text-red-500 hover:text-red-600 font-medium"
                      >
                        Obriši
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <Modal title={modal === 'add' ? 'Dodaj proizvod' : 'Izmeni proizvod'} onClose={closeModal}>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Naziv</label>
              <input
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Opis</label>
              <textarea
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                rows={3}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cena (RSD)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => set('price', parseFloat(e.target.value) || 0)}
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Lager</label>
                <input
                  type="number"
                  min="0"
                  value={form.stockQuantity}
                  onChange={(e) => set('stockQuantity', parseInt(e.target.value) || 0)}
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            {error && (
              <div className="bg-red-50 text-red-600 text-sm rounded-lg px-3 py-2">{error}</div>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 text-sm text-slate-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Otkaži
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 text-sm bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white rounded-lg transition-colors"
              >
                {saving ? 'Čuvanje...' : 'Sačuvaj'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
