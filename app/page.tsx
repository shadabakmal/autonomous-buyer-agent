'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import AutoBuyModal from '../components/AutoBuyModal';
import { Product, RetailerListing, AutoBuyRule, Order, UserSettings } from '../lib/types';
import { Bot, Sparkles, Sliders, ShieldCheck, Zap, ArrowRight, History, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<UserSettings>({
    maxSingleItemLimit: 500,
    monthlySpendLimit: 2500,
    monthlySpent: 649.99,
    requireApprovalOver: 200,
    autoBuyEnabled: true,
    smsNotifications: true,
    emailNotifications: true,
    preferredStores: ['Amazon', 'Best Buy', 'B&H Photo', 'Target'],
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

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [rules, setRules] = useState<AutoBuyRule[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedRetailer, setSelectedRetailer] = useState<RetailerListing | null>(null);

  // Fetch live products on page load
  useEffect(() => {
    async function loadLiveProducts() {
      setLoading(true);
      try {
        const res = await fetch('/api/products?q=electronics');
        const data = await res.json();
        if (data && data.products && data.products.length > 0) {
          setProducts(data.products);
          
          // Seed real active rules from live data
          setRules([
            {
              id: 'rule-1',
              productName: data.products[0].name,
              category: data.products[0].category,
              targetPrice: Math.round(data.products[0].retailers[0].price * 0.9),
              currentLowestPrice: data.products[0].retailers[0].price,
              maxBudget: 500,
              requireApproval: false,
              minRating: 4.5,
              status: 'active',
              createdAt: '2026-08-18',
              lastChecked: '5 mins ago',
              image: data.products[0].image,
            },
            {
              id: 'rule-2',
              productName: data.products[1]?.name || 'Wireless Headphones',
              category: 'Audio',
              targetPrice: 180,
              currentLowestPrice: data.products[1]?.retailers[0]?.price || 199,
              maxBudget: 250,
              requireApproval: true,
              minRating: 4.6,
              status: 'active',
              createdAt: '2026-08-20',
              lastChecked: '12 mins ago',
              image: data.products[1]?.image || data.products[0].image,
            },
          ]);
        }
      } catch (err) {
        console.error('Failed to load live products:', err);
      } finally {
        setLoading(false);
      }
    }
    loadLiveProducts();
  }, []);

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
              Compare live store prices, analyze 1,000s of verified customer reviews over live APIs, filter out bot scams, and automatically buy items when prices drop within your safety guardrails.
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
                  placeholder="Ask agent: 'Find laptops under $600 with best rating'..."
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
              <span className="text-slate-400 font-medium">Try live prompts:</span>
              {[
                'Find laptops under $500',
                'Find smartphones with best camera rating',
                'Compare audio gear prices',
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

        {/* Section: Live Top Recommended Products */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-100">Live API Recommended Deals</h2>
              <p className="text-xs text-slate-400">Fetched in real-time over live HTTP APIs & NLP review synthesis</p>
            </div>
            <Link href="/agent" className="flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:underline">
              <span>Ask Agent to Search More</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="py-16 text-center space-y-3 rounded-2xl border border-slate-800 bg-slate-900/60">
              <RefreshCw className="h-8 w-8 text-cyan-400 animate-spin mx-auto" />
              <div className="text-xs font-semibold text-slate-300">Fetching live market products over API...</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.slice(0, 6).map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  onSelectBuy={handleOpenBuyModal}
                  onSetRule={(p) => handleOpenBuyModal(p, p.retailers[0])}
                />
              ))}
            </div>
          )}
        </section>

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
