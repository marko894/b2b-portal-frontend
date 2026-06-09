'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import Modal from '@/components/Modal';
import { User, RegisterRequest } from '@/types';

const EMPTY_CREATE: RegisterRequest = {
  firstName: '', lastName: '', email: '', password: '',
  companyName: '', address: '', city: '', pib: '', phone: '',
};

interface EditForm {
  firstName: string; lastName: string; email: string; role: string;
  companyName: string; address: string; city: string; pib: string; phone: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // create
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState<RegisterRequest>(EMPTY_CREATE);
  const [creating, setCreating] = useState(false);

  // edit
  const [editUserId, setEditUserId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({
    firstName: '', lastName: '', email: '', role: 'CLIENT',
    companyName: '', address: '', city: '', pib: '', phone: '',
  });
  const [editing, setEditing] = useState(false);

  // password
  const [pwUserId, setPwUserId] = useState<number | null>(null);
  const [newPw, setNewPw] = useState('');
  const [savingPw, setSavingPw] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get<User[]>('/api/users');
      setUsers(data);
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function openEdit(u: User) {
    setEditForm({
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      role: u.role,
      companyName: u.companyName || '',
      address: u.companyAddress || '',
      city: u.companyCity || '',
      pib: u.companyPib || '',
      phone: u.companyPhone || '',
    });
    setEditUserId(u.id);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      const { data } = await api.post<User>('/api/users', createForm);
      setUsers((prev) => [...prev, data]);
      setShowCreate(false);
      setCreateForm(EMPTY_CREATE);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      alert(msg || 'Greška pri kreiranju korisnika');
    } finally {
      setCreating(false);
    }
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editUserId) return;
    setEditing(true);
    try {
      const { data } = await api.put<User>(`/api/users/${editUserId}`, editForm);
      setUsers((prev) => prev.map((u) => (u.id === editUserId ? data : u)));
      setEditUserId(null);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      alert(msg || 'Greška pri izmeni');
    } finally {
      setEditing(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!pwUserId) return;
    setSavingPw(true);
    try {
      await api.put(`/api/users/${pwUserId}/password`, { newPassword: newPw });
      setPwUserId(null);
      setNewPw('');
    } catch {
      alert('Greška pri promeni lozinke');
    } finally {
      setSavingPw(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Obrisati korisnika?')) return;
    try {
      await api.delete(`/api/users/${id}`);
      setUsers((u) => u.filter((x) => x.id !== id));
    } catch {
      alert('Greška pri brisanju');
    }
  }

  const inputCls = 'w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300';
  const labelCls = 'block text-xs font-medium text-slate-600 mb-1';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-slate-800">Korisnici / Firme</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-400">{users.length} ukupno</span>
          <button
            onClick={() => setShowCreate(true)}
            className="text-sm font-medium px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            + Dodaj korisnika
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-7 h-7 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-medium text-slate-500">Korisnik</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Email</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Rola</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Firma</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Grad</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">PIB</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Telefon</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center text-slate-400 py-10">Nema korisnika</td>
                </tr>
              )}
              {users.map((u) => (
                <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-800">{u.firstName} {u.lastName}</td>
                  <td className="px-4 py-3 text-slate-600">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      u.role === 'ADMIN' ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'
                    }`}>{u.role}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-700 font-medium">{u.companyName || '—'}</td>
                  <td className="px-4 py-3 text-slate-500">{u.companyCity || '—'}</td>
                  <td className="px-4 py-3 text-slate-500">{u.companyPib || '—'}</td>
                  <td className="px-4 py-3 text-slate-500">{u.companyPhone || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(u)}
                        className="text-xs text-blue-500 hover:text-blue-600 font-medium">Izmeni</button>
                      <button onClick={() => { setPwUserId(u.id); setNewPw(''); }}
                        className="text-xs text-slate-400 hover:text-slate-600 font-medium">Lozinka</button>
                      {u.role !== 'ADMIN' && (
                        <button onClick={() => handleDelete(u.id)}
                          className="text-xs text-red-500 hover:text-red-600 font-medium">Obriši</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <Modal onClose={() => setShowCreate(false)} title="Novi korisnik">
          <form onSubmit={handleCreate} className="space-y-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Lični podaci</p>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={labelCls}>Ime</label>
                <input required value={createForm.firstName} onChange={(e) => setCreateForm(p => ({ ...p, firstName: e.target.value }))} className={inputCls} /></div>
              <div><label className={labelCls}>Prezime</label>
                <input required value={createForm.lastName} onChange={(e) => setCreateForm(p => ({ ...p, lastName: e.target.value }))} className={inputCls} /></div>
            </div>
            <div><label className={labelCls}>Email</label>
              <input required type="email" value={createForm.email} onChange={(e) => setCreateForm(p => ({ ...p, email: e.target.value }))} className={inputCls} /></div>
            <div><label className={labelCls}>Lozinka</label>
              <input required type="password" value={createForm.password} onChange={(e) => setCreateForm(p => ({ ...p, password: e.target.value }))} className={inputCls} /></div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider pt-2">Podaci o firmi</p>
            <div><label className={labelCls}>Naziv firme</label>
              <input required value={createForm.companyName} onChange={(e) => setCreateForm(p => ({ ...p, companyName: e.target.value }))} className={inputCls} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={labelCls}>Adresa</label>
                <input required value={createForm.address} onChange={(e) => setCreateForm(p => ({ ...p, address: e.target.value }))} className={inputCls} /></div>
              <div><label className={labelCls}>Grad</label>
                <input required value={createForm.city} onChange={(e) => setCreateForm(p => ({ ...p, city: e.target.value }))} className={inputCls} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={labelCls}>PIB</label>
                <input required value={createForm.pib} onChange={(e) => setCreateForm(p => ({ ...p, pib: e.target.value }))} className={inputCls} /></div>
              <div><label className={labelCls}>Telefon</label>
                <input required value={createForm.phone} onChange={(e) => setCreateForm(p => ({ ...p, phone: e.target.value }))} className={inputCls} /></div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowCreate(false)}
                className="text-sm px-4 py-2 rounded-lg border border-gray-200 text-slate-600 hover:bg-gray-50">Otkaži</button>
              <button type="submit" disabled={creating}
                className="text-sm font-medium px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50">
                {creating ? 'Kreiranje...' : 'Kreiraj korisnika'}</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit modal */}
      {editUserId !== null && (
        <Modal onClose={() => setEditUserId(null)} title="Izmeni korisnika">
          <form onSubmit={handleEdit} className="space-y-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Lični podaci</p>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={labelCls}>Ime</label>
                <input required value={editForm.firstName} onChange={(e) => setEditForm(p => ({ ...p, firstName: e.target.value }))} className={inputCls} /></div>
              <div><label className={labelCls}>Prezime</label>
                <input required value={editForm.lastName} onChange={(e) => setEditForm(p => ({ ...p, lastName: e.target.value }))} className={inputCls} /></div>
            </div>
            <div><label className={labelCls}>Email</label>
              <input required type="email" value={editForm.email} onChange={(e) => setEditForm(p => ({ ...p, email: e.target.value }))} className={inputCls} /></div>
            <div>
              <label className={labelCls}>Rola</label>
              <select value={editForm.role} onChange={(e) => setEditForm(p => ({ ...p, role: e.target.value }))}
                className={inputCls}>
                <option value="CLIENT">CLIENT</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
            {editForm.companyName !== '' && (
              <>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider pt-2">Podaci o firmi</p>
                <div><label className={labelCls}>Naziv firme</label>
                  <input value={editForm.companyName} onChange={(e) => setEditForm(p => ({ ...p, companyName: e.target.value }))} className={inputCls} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className={labelCls}>Adresa</label>
                    <input value={editForm.address} onChange={(e) => setEditForm(p => ({ ...p, address: e.target.value }))} className={inputCls} /></div>
                  <div><label className={labelCls}>Grad</label>
                    <input value={editForm.city} onChange={(e) => setEditForm(p => ({ ...p, city: e.target.value }))} className={inputCls} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className={labelCls}>PIB</label>
                    <input value={editForm.pib} onChange={(e) => setEditForm(p => ({ ...p, pib: e.target.value }))} className={inputCls} /></div>
                  <div><label className={labelCls}>Telefon</label>
                    <input value={editForm.phone} onChange={(e) => setEditForm(p => ({ ...p, phone: e.target.value }))} className={inputCls} /></div>
                </div>
              </>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setEditUserId(null)}
                className="text-sm px-4 py-2 rounded-lg border border-gray-200 text-slate-600 hover:bg-gray-50">Otkaži</button>
              <button type="submit" disabled={editing}
                className="text-sm font-medium px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50">
                {editing ? 'Čuvanje...' : 'Sačuvaj izmene'}</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Password modal */}
      {pwUserId !== null && (
        <Modal onClose={() => setPwUserId(null)} title="Izmena lozinke">
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div><label className={labelCls}>Nova lozinka</label>
              <input required type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)}
                placeholder="Unesite novu lozinku" className={inputCls} /></div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setPwUserId(null)}
                className="text-sm px-4 py-2 rounded-lg border border-gray-200 text-slate-600 hover:bg-gray-50">Otkaži</button>
              <button type="submit" disabled={savingPw}
                className="text-sm font-medium px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50">
                {savingPw ? 'Čuvanje...' : 'Sačuvaj'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
