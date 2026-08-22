'use client';

import React, { useState } from 'react';
import MerchantNavbar from '../../components/MerchantNavbar';
import UpsellOfferCard from '../../components/UpsellOfferCard';
import RazorpayCheckoutModal from '../../components/RazorpayCheckoutModal';
import { MOCK_PRODUCTS } from '../../lib/mockData';
import { generateUpsellOffersForProduct, UpsellOffer } from '../../lib/upsellEngine';
import { Product } from '../../lib/types';
import { TrendingUp, Zap, DollarSign, Bot, ShoppingCart, ArrowRight, ShieldCheck } from 'lucide-react';

export default function MerchantDashboardPage() {
  const [selectedProduct, setSelectedProduct] = useState<Product>(MOCK_PRODUCTS[0]);
  const [selectedUpsells, setSelectedUpsells] = useState<UpsellOffer[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  const upsellOffers = generateUpsellOffersForProduct(selectedProduct);

  const basePrice = selectedProduct.retailers[0].price;
  const upsellTotal = selectedUpsells.reduce((acc, u) => acc + u.bundlePrice, 0);
  const totalCartPrice = basePrice + upsellTotal;

  const handleToggleUpsell = (offer: UpsellOffer) => {
    if (selectedUpsells.some((u) => u.id === offer.id)) {
      setSelectedUpsells(selectedUpsells.filter((u) => u.id !== offer.id));
    } else {
      setSelectedUpsells([...selectedUpsells, offer]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <MerchantNavbar />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Banner */}
        <section className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-slate-900 via-slate-900/80 to-slate-950 p-6 sm:p-10 shadow-2xl">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
          
          <div className="relative max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>AI Growth & Agentic Commerce Suite</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-100 leading-tight">
              Grow Merchant Revenue & Make Items <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">Sellable to AI Buyers</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Expose standardized machine-readable catalogs (ACP/AP2/x402), increase Average Order Value (AOV) via real-time AI upsell recommendations, and process payments securely via Razorpay Test-Mode APIs.
            </p>
          </div>
        </section>

        {/* Revenue KPI Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>AI BUYER ORDER VOLUME</span>
              <Bot className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-extrabold text-slate-100 font-mono">148 Orders</div>
            <p className="text-[11px] text-emerald-400">+24% volume from AI buyer agents</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>AOV BOOST VIA UPSELLS</span>
              <TrendingUp className="h-4 w-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-extrabold text-slate-100 font-mono">+$34.50 / order</div>
            <p className="text-[11px] text-cyan-400">18.4% Average AOV Increase</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>RAZORPAY TEST API STATUS</span>
              <ShieldCheck className="h-4 w-4 text-blue-400" />
            </div>
            <div className="text-2xl font-extrabold text-slate-100 font-mono">Connected</div>
            <p className="text-[11px] text-slate-400">Test-Mode Signatures Verified</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>PROTOCOL COMPLIANCE</span>
              <Zap className="h-4 w-4 text-amber-400" />
            </div>
            <div className="text-2xl font-extrabold text-slate-100 font-mono">ACP / AP2 / x402</div>
            <p className="text-[11px] text-slate-400">Machine-Readable Standard Ready</p>
          </div>
        </section>

        {/* AI Growth & Upsell Interactive Demo */}
        <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6 space-y-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-2">
            <div>
              <h2 className="text-xl font-extrabold text-slate-100">Live AI Upsell & In-App Checkout Simulator</h2>
              <p className="text-xs text-slate-400">Select a product to observe how the AI merchant agent attaches high-margin upsells during buyer checkout</p>
            </div>

            {/* Selector */}
            <select
              value={selectedProduct.id}
              onChange={(e) => {
                const p = MOCK_PRODUCTS.find((m) => m.id === e.target.value);
                if (p) {
                  setSelectedProduct(p);
                  setSelectedUpsells([]);
                }
              }}
              className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-semibold text-slate-100 focus:border-emerald-500 focus:outline-none"
            >
              {MOCK_PRODUCTS.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Product Card */}
            <div className="lg:col-span-1 rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-3">
              <img src={selectedProduct.image} alt={selectedProduct.name} className="h-40 w-full object-cover rounded-xl bg-slate-900 border border-slate-800" />
              <div>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">{selectedProduct.brand}</span>
                <h3 className="font-bold text-sm text-slate-100 line-clamp-1">{selectedProduct.name}</h3>
                <div className="text-sm font-mono font-bold text-emerald-400 mt-1">${basePrice.toFixed(2)}</div>
              </div>
            </div>

            {/* AI Upsell Recommendations */}
            <div className="lg:col-span-2 space-y-4">
              <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                AI Agent Proposed Upsell Recommendations (Revenue Growth Engine)
              </div>

              <div className="grid grid-cols-1 gap-3">
                {upsellOffers.map((offer) => (
                  <UpsellOfferCard
                    key={offer.id}
                    offer={offer}
                    isSelected={selectedUpsells.some((u) => u.id === offer.id)}
                    onToggle={handleToggleUpsell}
                  />
                ))}
              </div>

              {/* Checkout Calculation Summary */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <div className="text-xs text-slate-400">Total Cart Value (Base + Upsells):</div>
                  <div className="text-2xl font-extrabold text-emerald-400 font-mono">${totalCartPrice.toFixed(2)}</div>
                  {upsellTotal > 0 && (
                    <div className="text-[11px] text-cyan-400 font-medium">+${upsellTotal.toFixed(2)} added via AI Upsells</div>
                  )}
                </div>

                <button
                  onClick={() => setModalOpen(true)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-xs py-3 px-6 shadow-lg shadow-emerald-500/20 transition-all"
                >
                  <Zap className="h-4 w-4 fill-slate-950" />
                  Execute Razorpay Test Checkout
                </button>
              </div>

            </div>

          </div>
        </section>

      </main>

      {/* Razorpay Modal */}
      <RazorpayCheckoutModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        amount={totalCartPrice}
        productName={`${selectedProduct.name} ${selectedUpsells.length > 0 ? `(+ ${selectedUpsells.length} Upsells)` : ''}`}
        merchantName="AuraSound Direct Merchant"
        onSuccess={() => {
          setSelectedUpsells([]);
        }}
      />
    </div>
  );
}
