'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import AutoBuyModal from '../components/AutoBuyModal';
import { MOCK_PRODUCTS, INITIAL_RULES, INITIAL_ORDERS, INITIAL_USER_SETTINGS } from '../lib/mockData';
import { Product, RetailerListing, AutoBuyRule, Order, UserSettings } from '../lib/types';
import { Bot, Sparkles, Sliders, ShieldCheck, Zap, ArrowRight, TrendingDown, History, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<UserSettings>(INITIAL_USER_SETTINGS);
  const [products] = useState<Product[]>(MOCK_PRODUCTS);
  const [rules, setRules] = useState<AutoBuyRule[]>(INITIAL_RULES);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedRetailer, setSelectedRetailer] = useState<RetailerListing | null>(null);

  const handleQuickPrompt = (promptText: string) => {
    router.push(`/agent?query=${encodeURIComponent(promptText)}`);
  };

  const handleOpenBuyModal = (prod: Product, ret: RetailerListing) => {
    setSelectedProduct(prod);
    setSelectedRetailer(ret);
    setModalOpen(true);
  };

  const handleConfirmPurchase = (prod: Product, ret: RetailerListing) => {
    const total = ret.price + ret.shippingCost;
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: `ABA-${Math.floor(10000 + Math.random() * 90000)}-US`,
      productId: prod.id,
      productName: prod.name,
      productImage: prod.image,
      retailer: ret.name,
      pricePaid: ret.price,
      shippingCost: ret.shippingCost,
      tax: Math.round(ret.price * 0.08 * 100) / 100,
      total: Math.round((total + ret.price * 0.08) * 100) / 100,
      purchasedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'processing',
      trackingNumber: `TBA${Math.floor(100000000000 + Math.random() * 900000000000)}`,
      estimatedDelivery: '2 Days',
      agentReasoning: `Executed via Dashboard Agent Dispatch. Selected lowest verified seller (${ret.name}) for $${ret.price.toFixed(2)}.`,
      autoPurchased: true,
    };

    setOrders([newOrder, ...orders]);
    setSettings((prev) => ({
      ...prev,
      monthlySpent: prev.monthlySpent + ret.price,
    }));
  };

  const handleSaveRule = (productName: string, targetPrice: number, maxBudget: number, requireApproval: boolean) => {
    const newRule: AutoBuyRule = {
      id: `rule-${Date.now()}`,
      productName,
      category: 'Electronics',
      targetPrice,
      currentLowestPrice: selectedProduct ? selectedProduct.retailers[0].price : targetPrice + 20,
      maxBudget,
      requireApproval,
      minRating: 4.5,
      status: 'active',
      createdAt: new Date().toISOString().substring(0, 10),
      lastChecked: 'Just now',
      image: selectedProduct ? selectedProduct.image : 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=300&auto=format&fit=crop&q=80',
    };

    setRules([newRule, ...rules]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950">
      <Navbar settings={settings} />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Hero Prompt Section */}
        <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-slate-950 p-6 sm:p-10 shadow-2xl">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-12 -ml-12 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

          <div className="relative max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 px-3.5 py-1 text-xs font-semibold text-cyan-400 border border-cyan-500/20">
              <Sparkles className="h-3.5 w-3.5 animate-spin" />
              <span>Next-Gen Autonomous Buying Engine</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-100 leading-tight">
              Delegate your shopping to an <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">AI Buying Agent</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Compare live store prices, analyze 1,000s of verified customer reviews, filter out bot scams, and automatically buy items when prices drop within your safety guardrails.
            </p>

            {/* Prompt Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  router.push(`/agent?query=${encodeURIComponent(searchQuery)}`);
                }
              }}
              className="mt-6 flex flex-col sm:flex-row items-center gap-2 rounded-2xl bg-slate-950/80 p-2 border border-slate-800 shadow-xl"
            >
              <div className="flex flex-1 items-center gap-3 px-3 py-1 w-full">
                <Bot className="h-5 w-5 text-cyan-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Ask agent: 'Find noise canceling headphones under $200 with best call quality'..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-xs font-bold text-slate-950 hover:from-cyan-400 hover:to-blue-500 transition-all shadow-md shadow-cyan-500/20"
              >
                <Zap className="h-4 w-4 fill-slate-950" />
                Run Agent Search
              </button>
            </form>

            {/* Quick Suggestions */}
            <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
              <span className="text-slate-400 font-medium">Try prompts:</span>
              {[
                'Buy mechanical keyboard under $180',
                'Monitor Sony WH-1000XM5 for price drop below $300',
                'Find best 55-inch OLED TV for gaming',
              ].map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickPrompt(prompt)}
                  className="rounded-lg bg-slate-800/80 border border-slate-700/60 px-2.5 py-1 text-slate-300 hover:border-cyan-500/40 hover:text-cyan-300 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Quick Stats Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>ACTIVE WATCHLIST RULES</span>
              <Sliders className="h-4 w-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-extrabold text-slate-100 font-mono">{rules.length} Active Triggers</div>
            <p className="text-[11px] text-slate-400">Monitoring 5 storefronts continuously</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>MONTHLY SPEND CAP</span>
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-extrabold text-slate-100 font-mono">
              ${settings.monthlySpent.toFixed(0)} / ${settings.monthlySpendLimit}
            </div>
            <p className="text-[11px] text-emerald-400 font-medium">
              ${(settings.monthlySpendLimit - settings.monthlySpent).toFixed(0)} remaining budget
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>AUTONOMOUS PURCHASES</span>
              <History className="h-4 w-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-extrabold text-slate-100 font-mono">{orders.length} Orders Completed</div>
            <p className="text-[11px] text-slate-400">Total saved via agent deals: ~$142.50</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>MAX SINGLE ITEM LIMIT</span>
              <Zap className="h-4 w-4 text-amber-400" />
            </div>
            <div className="text-2xl font-extrabold text-slate-100 font-mono">${settings.maxSingleItemLimit}</div>
            <p className="text-[11px] text-slate-400">Require approval above ${settings.requireApprovalOver}</p>
          </div>
        </section>

        {/* Section: Featured Top Recommended Products */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-100">AI Top Recommended Deals</h2>
              <p className="text-xs text-slate-400">Highest sentiment score & best verified price cross-matches</p>
            </div>
            <Link href="/agent" className="flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:underline">
              <span>Ask Agent to Search More</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                onSelectBuy={handleOpenBuyModal}
                onSetRule={(p) => handleOpenBuyModal(p, p.retailers[0])}
              />
            ))}
          </div>
        </section>

        {/* Section: Active Trigger Watchlists Preview & Orders Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Active Auto-Buy Rules */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="h-4 w-4 text-cyan-400" />
                <h3 className="font-bold text-sm text-slate-100">Active Background Buying Rules</h3>
              </div>
              <Link href="/watchlists" className="text-xs text-cyan-400 hover:underline font-medium">
                Manage ({rules.length})
              </Link>
            </div>

            <div className="space-y-3">
              {rules.map((rule) => (
                <div key={rule.id} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-3">
                  <div className="flex items-center gap-3">
                    <img src={rule.image} alt={rule.productName} className="h-10 w-10 object-cover rounded-lg bg-slate-900" />
                    <div>
                      <h4 className="font-semibold text-xs text-slate-200 line-clamp-1">{rule.productName}</h4>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                        <span>Target: <strong className="text-emerald-400 font-mono">${rule.targetPrice}</strong></span>
                        <span>•</span>
                        <span>Current Lowest: ${rule.currentLowestPrice}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="inline-block rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                      Active Monitoring
                    </span>
                    <div className="text-[9px] text-slate-500 mt-1">Checked {rule.lastChecked}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Recent Orders Log */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-indigo-400" />
                <h3 className="font-bold text-sm text-slate-100">Recent Autonomous Purchases</h3>
              </div>
              <Link href="/orders" className="text-xs text-cyan-400 hover:underline font-medium">
                View All ({orders.length})
              </Link>
            </div>

            <div className="space-y-3">
              {orders.map((ord) => (
                <div key={ord.id} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-3">
                  <div className="flex items-center gap-3">
                    <img src={ord.productImage} alt={ord.productName} className="h-10 w-10 object-cover rounded-lg bg-slate-900" />
                    <div>
                      <h4 className="font-semibold text-xs text-slate-200 line-clamp-1">{ord.productName}</h4>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                        <span>Purchased from <strong className="text-slate-200">{ord.retailer}</strong></span>
                        <span>•</span>
                        <span className="font-mono text-emerald-400 font-bold">${ord.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="inline-block rounded-full bg-cyan-500/10 px-2 py-0.5 text-[10px] font-semibold text-cyan-400 border border-cyan-500/20 uppercase">
                      {ord.status}
                    </span>
                    <div className="text-[9px] text-slate-500 mt-1">{ord.purchasedAt}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>

      </main>

      {/* Auto Buy Modal */}
      <AutoBuyModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        product={selectedProduct}
        retailer={selectedRetailer}
        settings={settings}
        onConfirmPurchase={handleConfirmPurchase}
        onSaveRule={handleSaveRule}
      />
    </div>
  );
}
