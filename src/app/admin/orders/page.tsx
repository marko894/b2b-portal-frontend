'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/axios';
import Modal from '@/components/Modal';
import StatusBadge from '@/components/StatusBadge';
import { Order, OrderStatus, Product, User } from '@/types';

const NEXT_STATUSES: Partial<Record<OrderStatus, OrderStatus[]>> = {
  PENDING:  ['APPROVED', 'REJECTED'],
  APPROVED: ['SHIPPED'],
  SHIPPED:  ['DELIVERED'],
};

const STATUS_LABELS: Record<string, string> = {
  APPROVED: 'Odobri', REJECTED: 'Odbij', SHIPPED: 'Pošalji', DELIVERED: 'Isporučeno',
};

interface EditItem {
  productId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
}

type OrderModal =
  | { mode: 'edit'; orderId: number; items: EditItem[] }
  | { mode: 'create'; items: EditItem[]; userId: number | '' }
  | null;

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [clientUsers, setClientUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [updating, setUpdating] = useState<number | null>(null);

  const [modal, setModal] = useState<OrderModal>(null);
  const [addProductId, setAddProductId] = useState<number | ''>('');
  const [addQty, setAddQty] = useState(1);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [oRes, pRes, uRes] = await Promise.all([
        api.get<Order[]>('/api/orders'),
        api.get<Product[]>('/api/products'),
        api.get<User[]>('/api/users'),
      ]);
      setOrders(oRes.data);
      setProducts(pRes.data);
      setClientUsers(uRes.data.filter((u) => u.role === 'CLIENT' && u.companyId));
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function openEdit(o: Order) {
    setModal({
      mode: 'edit',
      orderId: o.id,
      items: o.items.map((i) => ({
        productId: i.productId,
        productName: i.productName,
        unitPrice: Number(i.unitPrice),
        quantity: i.quantity,
      })),
    });
    setAddProductId('');
    setAddQty(1);
  }

  function openCreate() {
    setModal({ mode: 'create', items: [], userId: '' });
    setAddProductId('');
    setAddQty(1);
  }

  function addItemToModal() {
    if (addProductId === '') return;
    const product = products.find((p) => p.id === addProductId);
    if (!product) return;
    setModal((prev) => {
      if (!prev) return prev;
      const existing = prev.items.findIndex((i) => i.productId === addProductId);
      if (existing >= 0) {
        const updated = [...prev.items];
        updated[existing] = { ...updated[existing], quantity: updated[existing].quantity + addQty };
        return { ...prev, items: updated };
      }
      return {
        ...prev,
        items: [...prev.items, {
          productId: product.id,
          productName: product.name,
          unitPrice: Number(product.price),
          quantity: addQty,
        }],
      };
    });
    setAddProductId('');
    setAddQty(1);
  }

  function removeItem(idx: number) {
    setModal((prev) => prev ? { ...prev, items: prev.items.filter((_, i) => i !== idx) } : prev);
  }

  function updateItemQty(idx: number, qty: number) {
    if (qty < 1) return;
    setModal((prev) => {
      if (!prev) return prev;
      const updated = [...prev.items];
      updated[idx] = { ...updated[idx], quantity: qty };
      return { ...prev, items: updated };
    });
  }

  async function saveModal() {
    if (!modal || modal.items.length === 0) return;
    setSaving(true);
    try {
      const itemsPayload = modal.items.map((i) => ({ productId: i.productId, quantity: i.quantity }));
      if (modal.mode === 'edit') {
        const { data } = await api.put<Order>(`/api/orders/${modal.orderId}`, { items: itemsPayload });
        setOrders((prev) => prev.map((o) => (o.id === modal.orderId ? data : o)));
      } else {
        if (modal.userId === '') return;
        const { data } = await api.post<Order>('/api/orders/admin', { userId: modal.userId, items: itemsPayload });
        setOrders((prev) => [...prev, data]);
      }
      setModal(null);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      alert(msg || 'Greška pri čuvanju porudžbenice');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Obrisati porudžbenicu? Zalihe će biti vraćene.')) return;
    try {
      await api.delete(`/api/orders/${id}`);
      setOrders((prev) => prev.filter((o) => o.id !== id));
    } catch {
      alert('Greška pri brisanju');
    }
  }

  async function updateStatus(orderId: number, status: OrderStatus) {
    setUpdating(orderId);
    try {
      await api.put(`/api/orders/${orderId}/status`, { status });
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
    } catch {
      alert('Greška pri izmeni statusa');
    } finally {
      setUpdating(null);
    }
  }

  function fmt(dt: string) {
    return new Date(dt).toLocaleString('sr-RS', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  }

  const modalTotal = modal ? modal.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0) : 0;

  const inputCls = 'text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-slate-800">Porudžbenice</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-400">{orders.length} ukupno</span>
          <button onClick={openCreate}
            className="text-sm font-medium px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
            + Nova porudžbenica
          </button>
        </div>
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
                <th className="text-left px-4 py-3 font-medium text-slate-500">ID</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Firma</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Korisnik</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Status</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Datum</th>
                <th className="text-right px-4 py-3 font-medium text-slate-500">Iznos</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 && (
                <tr><td colSpan={7} className="text-center text-slate-400 py-10">Nema porudžbenica</td></tr>
              )}
              {orders.map((o) => (
                <React.Fragment key={o.id}>
                  <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-slate-500">#{o.id}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{o.companyName}</td>
                    <td className="px-4 py-3 text-slate-600">{o.userName}</td>
                    <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{fmt(o.createdAt)}</td>
                    <td className="px-4 py-3 text-right font-medium text-slate-800">
                      {Number(o.totalAmount).toLocaleString('sr-RS')} RSD
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        {(NEXT_STATUSES[o.status] || []).map((next) => (
                          <button key={next} disabled={updating === o.id}
                            onClick={() => updateStatus(o.id, next)}
                            className={`text-xs font-medium px-2.5 py-1 rounded-lg transition-colors disabled:opacity-50 ${
                              next === 'REJECTED'
                                ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                            }`}>
                            {STATUS_LABELS[next]}
                          </button>
                        ))}
                        {o.status === 'PENDING' && (
                          <button onClick={() => openEdit(o)}
                            className="text-xs font-medium px-2.5 py-1 rounded-lg bg-gray-100 text-slate-600 hover:bg-gray-200 transition-colors">
                            Izmeni
                          </button>
                        )}
                        <button onClick={() => handleDelete(o.id)}
                          className="text-xs font-medium px-2.5 py-1 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                          Obriši
                        </button>
                        <button onClick={() => setExpanded(expanded === o.id ? null : o.id)}
                          className="text-xs text-slate-400 hover:text-slate-600 ml-1">
                          {expanded === o.id ? '▲' : '▼'}
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expanded === o.id && (
                    <tr className="bg-blue-50/30">
                      <td colSpan={7} className="px-6 py-4">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Stavke</p>
                        <div className="space-y-1">
                          {o.items.map((item) => (
                            <div key={item.id} className="flex items-center justify-between text-sm text-slate-600">
                              <span>{item.productName} × {item.quantity}</span>
                              <span className="font-medium text-slate-800">
                                {Number(item.subtotal).toLocaleString('sr-RS')} RSD
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Order edit / create modal */}
      {modal !== null && (
        <Modal
          onClose={() => setModal(null)}
          title={modal.mode === 'edit' ? `Izmena porudžbenice #${modal.orderId}` : 'Nova porudžbenica'}
          className="max-w-2xl overflow-x-hidden"
        >
          <div className="space-y-4">
            {/* User selector — only for create */}
            {modal.mode === 'create' && (
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Korisnik</label>
                <select
                  value={modal.userId}
                  onChange={(e) => setModal((prev) => prev ? { ...prev, userId: Number(e.target.value) } : prev)}
                  className={`w-full ${inputCls}`}
                >
                  <option value="">— Izaberi korisnika —</option>
                  {clientUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.firstName} {u.lastName} ({u.companyName})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Current items */}
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Stavke</p>
              {modal.items.length === 0 ? (
                <p className="text-sm text-slate-400 py-2">Nema stavki</p>
              ) : (
                <div className="space-y-2">
                  {modal.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                      <span className="flex-1 text-sm text-slate-700">{item.productName}</span>
                      <span className="text-xs text-slate-400 whitespace-nowrap">
                        {item.unitPrice.toLocaleString('sr-RS')} RSD
                      </span>
                      <input
                        type="number" min={1} value={item.quantity}
                        onChange={(e) => updateItemQty(idx, parseInt(e.target.value) || 1)}
                        className="w-16 text-center text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-300"
                      />
                      <span className="text-xs font-medium text-slate-700 w-24 text-right whitespace-nowrap">
                        {(item.unitPrice * item.quantity).toLocaleString('sr-RS')} RSD
                      </span>
                      <button onClick={() => removeItem(idx)}
                        className="text-red-400 hover:text-red-600 text-sm font-medium ml-1">✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add product */}
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Dodaj proizvod</p>
              <div className="flex gap-2">
                <select value={addProductId} onChange={(e) => setAddProductId(e.target.value ? Number(e.target.value) : '')}
                  className={`w-[70%] ${inputCls}`}>
                  <option value="">— Izaberi proizvod —</option>
                  {products.filter((p) => p.stockQuantity > 0).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {Number(p.price).toLocaleString('sr-RS')} RSD (zaliha: {p.stockQuantity})
                    </option>
                  ))}
                </select>
                <input type="number" min={1} value={addQty} onChange={(e) => setAddQty(Math.max(1, parseInt(e.target.value) || 1))}
                  className={`w-20 text-center ${inputCls}`} />
                <button onClick={addItemToModal} disabled={addProductId === ''}
                  className="text-sm font-medium px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg disabled:opacity-40 transition-colors whitespace-nowrap">
                  + Dodaj
                </button>
              </div>
            </div>

            {/* Total */}
            {modal.items.length > 0 && (
              <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                <span className="text-sm font-semibold text-slate-600">Ukupno</span>
                <span className="text-base font-bold text-slate-800">
                  {modalTotal.toLocaleString('sr-RS')} RSD
                </span>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setModal(null)}
                className="text-sm px-4 py-2 rounded-lg border border-gray-200 text-slate-600 hover:bg-gray-50">Otkaži</button>
              <button onClick={saveModal} disabled={saving || modal.items.length === 0 || (modal.mode === 'create' && modal.userId === '')}
                className="text-sm font-medium px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50">
                {saving ? 'Čuvanje...' : modal.mode === 'edit' ? 'Sačuvaj izmene' : 'Kreiraj porudžbenicu'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
