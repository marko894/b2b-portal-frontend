'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { useCart } from '@/context/CartContext';
import { Product } from '@/types';

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState<number | null>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    api.get<Product[]>('/api/products')
      .then(({ data }) => setProducts(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function handleAdd(p: Product) {
    addToCart(p, 1);
    setAdded(p.id);
    setTimeout(() => setAdded(null), 1200);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-slate-800">Katalog proizvoda</h1>
        <span className="text-sm text-slate-400">{products.length} artikala</span>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-7 h-7 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {products.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col"
            >
              <div className="flex-1">
                <h3 className="font-semibold text-slate-800 mb-1">{p.name}</h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-4 line-clamp-2">
                  {p.description}
                </p>
              </div>

              <div className="flex items-end justify-between">
                <div>
                  <p className="text-lg font-bold text-slate-800">
                    {Number(p.price).toLocaleString('sr-RS')}
                    <span className="text-sm font-normal text-slate-500 ml-1">RSD</span>
                  </p>
                  <p className={`text-xs mt-0.5 ${
                    p.stockQuantity === 0 ? 'text-red-500' : 'text-slate-400'
                  }`}>
                    {p.stockQuantity === 0 ? 'Nema na lageru' : `${p.stockQuantity} na lageru`}
                  </p>
                </div>

                <button
                  disabled={p.stockQuantity === 0}
                  onClick={() => handleAdd(p)}
                  className={`text-sm font-medium px-3 py-2 rounded-lg transition-all ${
                    added === p.id
                      ? 'bg-green-500 text-white scale-95'
                      : p.stockQuantity === 0
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  {added === p.id ? '✓ Dodato' : 'Dodaj'}
                </button>
              </div>
            </div>
          ))}

          {products.length === 0 && (
            <div className="col-span-3 text-center text-slate-400 py-16">
              Nema dostupnih proizvoda
            </div>
          )}
        </div>
      )}
    </div>
  );
}
