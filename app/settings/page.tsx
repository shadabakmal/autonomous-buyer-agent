'use client';

import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import { UserSettings, formatINR } from '../../lib/types';
import { ShieldCheck, CreditCard, MapPin, Sliders, Save, Check } from 'lucide-react';

export default function SettingsPage() {
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

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Navbar settings={settings} />

      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Page Header */}
        <div className="border-b border-slate-800 pb-6">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs uppercase tracking-wider mb-1">
            <ShieldCheck className="h-4 w-4" />
            Autonomous Protection & Wallet Control (INR ₹)
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">Safety Guardrails & Settings</h1>
          <p className="text-xs text-slate-400 mt-1">Configure spending limits in ₹, approval triggers, and payment methods</p>
        </div>

        {savedSuccess && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-4 text-xs font-semibold text-emerald-300 flex items-center gap-2">
            <Check className="h-4 w-4" />
            Guardrail settings updated successfully!
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          
          {/* Section 1: Spending Caps */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-6 shadow-xl">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-100 border-b border-slate-800 pb-3">
              <Sliders className="h-4 w-4 text-cyan-400" />
              Autonomous Spending Caps & Thresholds (in ₹ INR)
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Single Item Maximum Limit (₹)
                </label>
                <input
                  type="number"
                  value={settings.maxSingleItemLimit}
                  onChange={(e) => setSettings({ ...settings, maxSingleItemLimit: Number(e.target.value) })}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm text-slate-100 font-mono focus:border-cyan-500 focus:outline-none"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Agent will never buy any single item costing more than {formatINR(settings.maxSingleItemLimit)} automatically.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Monthly Total Spend Cap (₹)
                </label>
                <input
                  type="number"
                  value={settings.monthlySpendLimit}
                  onChange={(e) => setSettings({ ...settings, monthlySpendLimit: Number(e.target.value) })}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm text-slate-100 font-mono focus:border-cyan-500 focus:outline-none"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Hard ceiling for total combined agent purchases per calendar month.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Require 1-Tap Manual Approval for Purchases Over (₹)
              </label>
              <input
                type="number"
                value={settings.requireApprovalOver}
                onChange={(e) => setSettings({ ...settings, requireApprovalOver: Number(e.target.value) })}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm text-slate-100 font-mono focus:border-cyan-500 focus:outline-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Purchases below this amount execute instantly. Purchases above require user confirmation.
              </p>
            </div>
          </div>

          {/* Section 2: Preferred Indian Retailers */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-100 border-b border-slate-800 pb-3">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              Approved Storefronts Matrix (India & Global)
            </div>

            <div className="flex flex-wrap gap-3">
              {['Amazon India', 'Flipkart', 'Croma', 'Reliance Digital', 'Tata CLiQ', 'Keychron Direct'].map((store) => {
                const isSelected = settings.preferredStores.includes(store);
                return (
                  <button
                    type="button"
                    key={store}
                    onClick={() => {
                      if (isSelected) {
                        setSettings({
                          ...settings,
                          preferredStores: settings.preferredStores.filter((s) => s !== store),
                        });
                      } else {
                        setSettings({
                          ...settings,
                          preferredStores: [...settings.preferredStores, store],
                        });
                      }
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      isSelected
                        ? 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300 shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '} {store}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Shipping & Sandbox Wallet */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-6 shadow-xl">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-100 border-b border-slate-800 pb-3">
              <CreditCard className="h-4 w-4 text-indigo-400" />
              Razorpay Test Wallet & Default Delivery Address
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2">
                <div className="flex items-center gap-2 font-semibold text-slate-200">
                  <MapPin className="h-4 w-4 text-cyan-400" /> Shipping Destination
                </div>
                <div className="text-slate-300">{settings.shippingAddress.name}</div>
                <div className="text-slate-400">{settings.shippingAddress.street}</div>
                <div className="text-slate-400">
                  {settings.shippingAddress.city}, {settings.shippingAddress.state} {settings.shippingAddress.zip}
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2">
                <div className="flex items-center gap-2 font-semibold text-slate-200">
                  <CreditCard className="h-4 w-4 text-emerald-400" /> Razorpay Payment Credential
                </div>
                <div className="text-slate-300">UPI / Razorpay Test Card</div>
                <div className="font-mono text-slate-400">•••• •••• •••• {settings.paymentMethod.last4}</div>
                <div className="text-slate-400">Expires: {settings.paymentMethod.expiry}</div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-xs font-bold text-slate-950 hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/20"
            >
              <Save className="h-4 w-4" />
              Save Safety Guardrail Configuration
            </button>
          </div>

        </form>

      </main>
    </div>
  );
}
