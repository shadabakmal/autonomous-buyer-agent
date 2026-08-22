'use client';

import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import { AutoBuyRule, UserSettings, formatINR } from '../../lib/types';
import { Sliders, Plus, Trash2, Pause, Play } from 'lucide-react';

export default function WatchlistsPage() {
  const [settings] = useState<UserSettings>({
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

  const [rules, setRules] = useState<AutoBuyRule[]>([
    {
      id: 'rule-1',
      productName: 'Sony WH-1000XM5 Noise Canceling Headphones',
      category: 'Audio',
      targetPrice: 24990,
      currentLowestPrice: 26990,
      maxBudget: 30000,
      requireApproval: false,
      minRating: 4.5,
      status: 'active',
      createdAt: '2026-08-10',
      lastChecked: '5 mins ago',
      image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=300&auto=format&fit=crop&q=80',
    },
    {
      id: 'rule-2',
      productName: 'Keychron Q1 Pro Mechanical Keyboard',
      category: 'Peripherals',
      targetPrice: 14500,
      currentLowestPrice: 15999,
      maxBudget: 18000,
      requireApproval: true,
      minRating: 4.6,
      status: 'active',
      createdAt: '2026-08-15',
      lastChecked: '12 mins ago',
      image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=300&auto=format&fit=crop&q=80',
    },
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newTargetPrice, setNewTargetPrice] = useState(12000);
  const [newMaxBudget, setNewMaxBudget] = useState(20000);
  const [newReqAppr, setNewReqAppr] = useState(true);

  const handleTogglePause = (id: string) => {
    setRules((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          return {
            ...r,
            status: r.status === 'active' ? 'paused' : 'active',
          };
        }
        return r;
      })
    );
  };

  const handleDeleteRule = (id: string) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
  };

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim()) return;

    const newRule: AutoBuyRule = {
      id: `rule-${Date.now()}`,
      productName: newProdName,
      category: 'Electronics',
      targetPrice: Number(newTargetPrice),
      currentLowestPrice: Number(newTargetPrice) + 1500,
      maxBudget: Number(newMaxBudget),
      requireApproval: newReqAppr,
      minRating: 4.5,
      status: 'active',
      createdAt: new Date().toISOString().substring(0, 10),
      lastChecked: 'Just now',
      image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=300&auto=format&fit=crop&q=80',
    };

    setRules([newRule, ...rules]);
    setNewProdName('');
    setShowAddForm(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Navbar settings={settings} />

      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs uppercase tracking-wider mb-1">
              <Sliders className="h-4 w-4" />
              Automated Purchasing Triggers (INR)
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">Auto-Buy Watchlist Manager</h1>
          </div>

          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-xs font-bold text-slate-950 hover:from-cyan-400 hover:to-blue-500 transition-all shadow-md"
          >
            <Plus className="h-4 w-4" />
            Create Auto-Buy Trigger
          </button>
        </div>

        {/* Create Rule Form Card */}
        {showAddForm && (
          <form onSubmit={handleCreateRule} className="rounded-2xl border border-cyan-500/30 bg-slate-900/90 p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-base text-cyan-400">Add New Automated Purchasing Rule (in ₹)</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Product Name / Keywords</label>
                <input
                  type="text"
                  placeholder="e.g. Sony WH-1000XM5"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Target Auto-Buy Price (₹)</label>
                <input
                  type="number"
                  value={newTargetPrice}
                  onChange={(e) => setNewTargetPrice(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs text-slate-100 font-mono focus:border-cyan-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Max Ceiling Budget (₹)</label>
                <input
                  type="number"
                  value={newMaxBudget}
                  onChange={(e) => setNewMaxBudget(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs text-slate-100 font-mono focus:border-cyan-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="reqCheck"
                checked={newReqAppr}
                onChange={(e) => setNewReqAppr(e.target.checked)}
                className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-cyan-500"
              />
              <label htmlFor="reqCheck" className="text-xs text-slate-300">
                Send push alert for 1-tap confirmation before checkout
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold rounded-xl bg-cyan-500 text-slate-950 hover:bg-cyan-400"
              >
                Save Trigger Rule
              </button>
            </div>
          </form>
        )}

        {/* Active Rules Grid */}
        <div className="space-y-4">
          {rules.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-12 text-center text-slate-400">
              No active auto-buy trigger rules. Click "Create Auto-Buy Trigger" to set your first background agent rule.
            </div>
          ) : (
            rules.map((rule) => (
              <div
                key={rule.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/80 p-5 gap-4 shadow-xl"
              >
                <div className="flex items-center gap-4">
                  <img src={rule.image} alt={rule.productName} className="h-16 w-16 object-cover rounded-xl bg-slate-950 border border-slate-800" />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                        rule.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {rule.status === 'active' ? 'ACTIVE MONITORING' : 'PAUSED'}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">Created {rule.createdAt}</span>
                    </div>

                    <h3 className="font-bold text-sm text-slate-100">{rule.productName}</h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs font-mono pt-1">
                      <div className="text-slate-400">
                        Target Price: <strong className="text-emerald-400">{formatINR(rule.targetPrice)}</strong>
                      </div>
                      <div className="text-slate-400">
                        Lowest Right Now: <strong className="text-slate-200">{formatINR(rule.currentLowestPrice)}</strong>
                      </div>
                      <div className="text-slate-400">
                        Require Approval: <strong className="text-cyan-400">{rule.requireApproval ? 'Yes' : 'No'}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => handleTogglePause(rule.id)}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-semibold text-slate-300 hover:border-slate-600 transition-colors"
                  >
                    {rule.status === 'active' ? <Pause className="h-3.5 w-3.5 text-amber-400" /> : <Play className="h-3.5 w-3.5 text-emerald-400" />}
                    {rule.status === 'active' ? 'Pause' : 'Resume'}
                  </button>

                  <button
                    onClick={() => handleDeleteRule(rule.id)}
                    className="p-2 rounded-xl border border-slate-800 bg-slate-950 text-slate-400 hover:text-rose-400 hover:border-rose-500/30 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </main>
    </div>
  );
}
