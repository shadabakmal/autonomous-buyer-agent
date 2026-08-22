'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import SentimentAnalyzer from '../../components/SentimentAnalyzer';
import PriceHistoryChart from '../../components/PriceHistoryChart';
import AutoBuyModal from '../../components/AutoBuyModal';
import { Product, RetailerListing, UserSettings, formatINR } from '../../lib/types';
import { Scale, Star, Zap, RefreshCw } from 'lucide-react';

export default function ComparePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [settings, setSettings] = useState<UserSettings>({
    maxSingleItemLimit: 50000,
    monthlySpendLimit: 250000,
    monthlySpent: 64990,
    requireApprovalOver: 15000,
    autoBuyEnabled: true,
    smsNotifications: true,
    emailNotifications: true,
    preferredStores: ['Amazon India', 'Flipkart', 'Croma', 'Reliance Digital'],
    shippingAddress: {
      name: 'Alex Johnson',
      street: '742 Evergreen Terrace',
      city: 'San Francisco',
      state: 'CA',
      zip: '94107',
    },
    paymentMethod: {
      type: 'Credit Card',
      last4: '4829',
      expiry: '08/28',
      brand: 'Visa Infinite',
    },
  });

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRetailer, setSelectedRetailer] = useState<RetailerListing | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [prodRes, setRes] = await Promise.all([
          fetch('/api/products?q=smartphones'),
          fetch('/api/settings'),
        ]);

        const prodData = await prodRes.json();
        if (prodData && prodData.products && prodData.products.length > 0) {
          setProducts(prodData.products);
          setSelectedProductId(prodData.products[0].id);
        }

        const setData = await setRes.json();
        if (setData && setData.settings) {
          setSettings(setData.settings);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const selectedProduct = products.find((p) => p.id === selectedProductId) || products[0];

  const handleOpenBuyModal = (ret: RetailerListing) => {
    setSelectedRetailer(ret);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Navbar settings={settings} />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Page Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs uppercase tracking-wider mb-1">
              <Scale className="h-4 w-4" />
              Multi-Retailer Price & Sentiment Intelligence Hub (INR ₹)
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">Product Deep Dive & Store Matrix</h1>
          </div>

          {/* Product Selector */}
          {products.length > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 font-medium hidden sm:inline">Select Product:</span>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-100 focus:border-cyan-500 focus:outline-none"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({formatINR(p.retailers[0].price)})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {loading || !selectedProduct ? (
          <div className="py-16 text-center space-y-3 rounded-2xl border border-slate-800 bg-slate-900/60">
            <RefreshCw className="h-8 w-8 text-cyan-400 animate-spin mx-auto" />
            <div className="text-xs font-semibold text-slate-300">Loading live multi-store comparison matrix in INR...</div>
          </div>
        ) : (
          <>
            {/* Selected Product Overview Banner */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl flex flex-col md:flex-row gap-6">
              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
                className="h-48 w-full md:w-64 object-cover rounded-2xl bg-slate-950 border border-slate-800"
              />

              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-cyan-500/10 px-2.5 py-1 text-xs font-bold text-cyan-400 border border-cyan-500/20">
                    {selectedProduct.brand}
                  </span>
                  <span className="text-xs text-slate-400">{selectedProduct.category}</span>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-slate-100">{selectedProduct.name}</h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{selectedProduct.description}</p>

                {/* Key Specs Pills */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {Object.entries(selectedProduct.specs).map(([key, val], idx) => (
                    <div key={idx} className="rounded-lg bg-slate-950 border border-slate-800 px-3 py-1 text-xs">
                      <span className="text-slate-400">{key}: </span>
                      <strong className="text-slate-200">{val}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Retailer Store Comparison Table (Formatted in formatINR ₹) */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg text-slate-100">Live Cross-Store Matrix ({selectedProduct.retailers.length} Retailers)</h3>
                <span className="text-xs text-slate-400">Taxes & shipping dynamically calculated over HTTP</span>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-semibold">
                      <th className="py-3.5 px-4">Store / Platform</th>
                      <th className="py-3.5 px-4">Listed Price</th>
                      <th className="py-3.5 px-4">Shipping & ETA</th>
                      <th className="py-3.5 px-4">Seller Rating</th>
                      <th className="py-3.5 px-4">Return Policy</th>
                      <th className="py-3.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {selectedProduct.retailers.map((ret) => (
                      <tr key={ret.id} className={`hover:bg-slate-800/40 transition-colors ${ret.isBestValue ? 'bg-cyan-950/20' : ''}`}>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2.5 font-semibold text-slate-100">
                            <span className="text-base">{ret.logo}</span>
                            <span>{ret.name}</span>
                            {ret.isBestValue && (
                              <span className="rounded bg-cyan-500/20 text-cyan-300 px-2 py-0.5 text-[10px] font-bold">
                                LOWEST PRICE
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-4 px-4 font-mono">
                          <div className="text-sm font-bold text-emerald-400">{formatINR(ret.price)}</div>
                          {ret.originalPrice > ret.price && (
                            <div className="line-through text-slate-500 text-[10px]">
                              MSRP {formatINR(ret.originalPrice)}
                            </div>
                          )}
                        </td>

                        <td className="py-4 px-4 text-slate-300">
                          <div>{ret.shipping}</div>
                          <div className="text-[10px] text-slate-400">ETA: {ret.deliveryEstimate}</div>
                        </td>

                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1 font-bold text-amber-400 font-mono">
                            <Star className="h-3.5 w-3.5 fill-amber-400" />
                            {ret.sellerRating}/5.0
                          </div>
                        </td>

                        <td className="py-4 px-4 text-slate-300">{ret.returnPolicy}</td>

                        <td className="py-4 px-4 text-right">
                          <button
                            onClick={() => handleOpenBuyModal(ret)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-3.5 py-2 text-xs font-bold text-slate-950 hover:from-cyan-400 hover:to-blue-500 transition-all shadow-md"
                          >
                            <Zap className="h-3.5 w-3.5 fill-slate-950" />
                            Buy on {ret.name}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* AI Sentiment Analysis & Fake Review Detector */}
            <section className="space-y-4">
              <SentimentAnalyzer sentiment={selectedProduct.sentiment} productName={selectedProduct.name} />
            </section>

            {/* Price History & Drop Forecast */}
            <section className="space-y-4">
              <PriceHistoryChart
                priceHistory={selectedProduct.priceHistory}
                predictedDrop={selectedProduct.predictedPriceDrop}
              />
            </section>
          </>
        )}

      </main>

      {/* Auto Buy Modal */}
      <AutoBuyModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        product={selectedProduct}
        retailer={selectedRetailer}
        settings={settings}
        onConfirmPurchase={(p, r) => {
          setSettings((prev) => ({
            ...prev,
            monthlySpent: prev.monthlySpent + r.price,
          }));
        }}
        onSaveRule={() => {}}
      />
    </div>
  );
}
