'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/axios';
import StatusBadge from '@/components/StatusBadge';
import { Order } from '@/types';

export default function ClientOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    api.get<Order[]>('/api/orders')
      .then(({ data }) => setOrders(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function fmt(dt: string) {
    return new Date(dt).toLocaleString('sr-RS', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-slate-800">Moje porudžbenice</h1>
        <span className="text-sm text-slate-400">{orders.length} ukupno</span>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-7 h-7 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-slate-400 text-sm">Nemate porudžbenica</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-medium text-slate-500">ID</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Status</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Datum</th>
                <th className="text-right px-4 py-3 font-medium text-slate-500">Iznos</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <React.Fragment key={o.id}>
                  <tr
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 text-slate-500">#{o.id}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{fmt(o.createdAt)}</td>
                    <td className="px-4 py-3 text-right font-medium text-slate-800">
                      {Number(o.totalAmount).toLocaleString('sr-RS')} RSD
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setExpanded(expanded === o.id ? null : o.id)}
                        className="text-xs text-slate-400 hover:text-slate-600"
                      >
                        {expanded === o.id ? '▲ Sakrij' : '▼ Stavke'}
                      </button>
                    </td>
                  </tr>
                  {expanded === o.id && (
                    <tr className="bg-blue-50/30">
                      <td colSpan={5} className="px-6 py-4">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                          Stavke porudžbenice
                        </p>
                        <div className="space-y-1.5">
                          {o.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between text-sm"
                            >
                              <span className="text-slate-600">
                                {item.productName}
                                <span className="text-slate-400 ml-2">
                                  × {item.quantity} ×{' '}
                                  {Number(item.unitPrice).toLocaleString('sr-RS')} RSD
                                </span>
                              </span>
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
    </div>
  );
}
