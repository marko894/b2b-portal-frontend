'use client';

import { useState, useEffect, FormEvent } from 'react';
import api from '@/lib/axios';
import Modal from '@/components/Modal';
import { Company, CompanyRequest } from '@/types';

const EMPTY: CompanyRequest = { name: '', address: '', city: '', pib: '', phone: '', email: '' };

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [selected, setSelected] = useState<Company | null>(null);
  const [form, setForm] = useState<CompanyRequest>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get<Company[]>('/api/companies');
      setCompanies(data);
    } catch {
      // handled by interceptor
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

  function openEdit(c: Company) {
    setSelected(c);
    setForm({ name: c.name, address: c.address, city: c.city, pib: c.pib, phone: c.phone, email: c.email });
    setError('');
    setModal('edit');
  }

  function closeModal() { setModal(null); setSelected(null); }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (modal === 'add') {
        await api.post('/api/companies', form);
      } else if (selected) {
        await api.put(`/api/companies/${selected.id}`, form);
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
    if (!confirm('Obrisati firmu?')) return;
    try {
      await api.delete(`/api/companies/${id}`);
      setCompanies((c) => c.filter((x) => x.id !== id));
    } catch {
      alert('Greška pri brisanju');
    }
  }

  function set(key: keyof CompanyRequest, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const FIELDS: { key: keyof CompanyRequest; label: string; type?: string }[] = [
    { key: 'name', label: 'Naziv firme' },
    { key: 'address', label: 'Adresa' },
    { key: 'city', label: 'Grad' },
    { key: 'pib', label: 'PIB' },
    { key: 'phone', label: 'Telefon' },
    { key: 'email', label: 'Email', type: 'email' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-slate-800">Firme</h1>
        <button
          onClick={openAdd}
          className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Dodaj firmu
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
                <th className="text-left px-4 py-3 font-medium text-slate-500">Grad</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">PIB</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Telefon</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Email</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {companies.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-slate-400 py-10">Nema firmi</td>
                </tr>
              )}
              {companies.map((c) => (
                <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-800">{c.name}</td>
                  <td className="px-4 py-3 text-slate-600">{c.city}</td>
                  <td className="px-4 py-3 text-slate-600">{c.pib}</td>
                  <td className="px-4 py-3 text-slate-600">{c.phone}</td>
                  <td className="px-4 py-3 text-slate-600">{c.email}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(c)}
                        className="text-xs text-blue-500 hover:text-blue-600 font-medium"
                      >
                        Izmeni
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
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
        <Modal title={modal === 'add' ? 'Dodaj firmu' : 'Izmeni firmu'} onClose={closeModal}>
          <form onSubmit={handleSave} className="space-y-4">
            {FIELDS.map((f) => (
              <div key={f.key}>
                <label className="block text-sm font-medium text-slate-700 mb-1">{f.label}</label>
                <input
                  type={f.type || 'text'}
                  value={form[f.key]}
                  onChange={(e) => set(f.key, e.target.value)}
                  required={f.key === 'name' || f.key === 'pib'}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
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
