'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/axios';
import { useCart } from '@/context/CartContext';

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, clearCart, totalAmount } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleOrder() {
    if (items.length === 0) return;
    setSubmitting(true);
    setError('');
    try {
      await api.post('/api/orders', {
        items: items.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
      });
      clearCart();
      router.push('/client/orders');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || 'Greška pri kreiranju porudžbenice');
    } finally {
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <div>
        <h1 className="text-xl font-semibold text-slate-800 mb-6">Korpa</h1>
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-slate-400 text-sm">Korpa je prazna</p>
          <Link
            href="/client/catalog"
            className="mt-4 inline-block text-sm text-blue-500 hover:text-blue-600 font-medium"
          >
            Idi na katalog →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-slate-800">Korpa</h1>
        <button
          onClick={clearCart}
          className="text-sm text-slate-400 hover:text-red-500 transition-colors"
        >
          Isprazni korpu
        </button>
      </div>

      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {items.map((item, i) => (
              <div
                key={item.product.id}
                className={`flex items-center gap-4 px-5 py-4 ${
                  i < items.length - 1 ? 'border-b border-gray-100' : ''
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 truncate">{item.product.name}</p>
                  <p className="text-sm text-slate-500">
                    {Number(item.product.price).toLocaleString('sr-RS')} RSD / kom
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    className="w-7 h-7 rounded-md border border-gray-200 text-slate-600 hover:bg-gray-50 text-sm font-medium flex items-center justify-center"
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-sm font-medium text-slate-800">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() =>
                      updateQuantity(
                        item.product.id,
                        Math.min(item.quantity + 1, item.product.stockQuantity)
                      )
                    }
                    disabled={item.quantity >= item.product.stockQuantity}
                    className="w-7 h-7 rounded-md border border-gray-200 text-slate-600 hover:bg-gray-50 disabled:opacity-40 text-sm font-medium flex items-center justify-center"
                  >
                    +
                  </button>
                </div>

                <p className="w-28 text-right font-medium text-slate-800">
                  {(Number(item.product.price) * item.quantity).toLocaleString('sr-RS')} RSD
                </p>

                <button
                  onClick={() => removeFromCart(item.product.id)}
                  className="text-slate-300 hover:text-red-400 transition-colors text-lg leading-none"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-0">
            <h2 className="font-semibold text-slate-800 mb-4">Rezime</h2>
            <div className="space-y-2 mb-4">
              {items.map((i) => (
                <div key={i.product.id} className="flex justify-between text-sm text-slate-600">
                  <span className="truncate flex-1 mr-2">{i.product.name}</span>
                  <span className="whitespace-nowrap">
                    {(Number(i.product.price) * i.quantity).toLocaleString('sr-RS')} RSD
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-3 mb-4">
              <div className="flex justify-between font-semibold text-slate-800">
                <span>Ukupno</span>
                <span>{totalAmount.toLocaleString('sr-RS')} RSD</span>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm rounded-lg px-3 py-2 mb-3">
                {error}
              </div>
            )}

            <button
              onClick={handleOrder}
              disabled={submitting}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg transition-colors text-sm"
            >
              {submitting ? 'Slanje...' : 'Naruči'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
