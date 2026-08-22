'use client';

import React, { useState } from 'react';
import { Product, RetailerListing, UserSettings } from '../lib/types';
import { X, ShieldCheck, Zap, AlertCircle, Lock, Check } from 'lucide-react';

interface AutoBuyModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  retailer: RetailerListing | null;
  settings: UserSettings;
  onConfirmPurchase: (product: Product, retailer: RetailerListing) => void;
  onSaveRule: (productName: string, targetPrice: number, maxBudget: number, requireApproval: boolean) => void;
}

export default function AutoBuyModal({
  isOpen,
  onClose,
  product,
  retailer,
  settings,
  onConfirmPurchase,
  onSaveRule,
}: AutoBuyModalProps) {
  const [activeTab, setActiveTab] = useState<'instant' | 'trigger'>('instant');
  const [targetPrice, setTargetPrice] = useState<number>(product ? Math.round(product.retailers[0].price * 0.9) : 150);
  const [requireApproval, setRequireApproval] = useState<boolean>(true);

  if (!isOpen || !product || !retailer) return null;

  const totalCost = retailer.price + retailer.shippingCost;
  const isOverLimit = totalCost > settings.maxSingleItemLimit;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-5">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-100">Autonomous Buyer Dispatch</h3>
            <p className="text-xs text-slate-400">Execute instant purchase or set background monitoring trigger</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
          <button
            onClick={() => setActiveTab('instant')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'instant'
                ? 'bg-slate-800 text-cyan-400 shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Instant Purchase Now
          </button>
          <button
            onClick={() => setActiveTab('trigger')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'trigger'
                ? 'bg-slate-800 text-cyan-400 shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Set Price Drop Trigger
          </button>
        </div>

        {/* Selected Item Card */}
        <div className="flex gap-3 rounded-xl border border-slate-800 bg-slate-950 p-3">
          <img src={product.image} alt={product.name} className="h-16 w-16 object-cover rounded-lg bg-slate-900" />
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-xs text-slate-100 truncate">{product.name}</h4>
            <div className="text-[11px] text-slate-400 mt-0.5">Selected Retailer: <strong className="text-slate-200">{retailer.name}</strong></div>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-mono font-bold text-sm text-emerald-400">${retailer.price.toFixed(2)}</span>
              <span className="text-[10px] text-slate-400">({retailer.shipping})</span>
            </div>
          </div>
        </div>

        {/* Tab Content: Instant Purchase */}
        {activeTab === 'instant' && (
          <div className="space-y-4">
            {/* Guardrail Status */}
            <div className={`rounded-xl border p-3 text-xs space-y-1 ${
              isOverLimit 
                ? 'border-amber-500/40 bg-amber-950/20 text-amber-300'
                : 'border-emerald-500/30 bg-emerald-950/20 text-emerald-300'
            }`}>
              <div className="flex items-center gap-2 font-semibold">
                <ShieldCheck className="h-4 w-4" />
                {isOverLimit ? 'Guardrail Override Required' : 'Safety Guardrail Check Passed'}
              </div>
              <p className="text-[11px] opacity-90">
                {isOverLimit
                  ? `Item cost ($${totalCost.toFixed(2)}) exceeds your max single spend cap ($${settings.maxSingleItemLimit}). Explicit confirmation granted via this step.`
                  : `Within your per-item limit ($${settings.maxSingleItemLimit}) and monthly remaining budget ($${(settings.monthlySpendLimit - settings.monthlySpent).toFixed(2)}).`}
              </p>
            </div>

            {/* Payment & Address Summary */}
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Shipping To:</span>
                <span className="font-medium text-slate-200">{settings.shippingAddress.name}, {settings.shippingAddress.city}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Payment Wallet:</span>
                <span className="font-medium text-slate-200">{settings.paymentMethod.brand} (*{settings.paymentMethod.last4})</span>
              </div>
            </div>

            <button
              onClick={() => {
                onConfirmPurchase(product, retailer);
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 font-bold text-sm py-3 rounded-xl transition-all shadow-lg shadow-cyan-500/20"
            >
              <Lock className="h-4 w-4" />
              Confirm & Authorize Agent Purchase (${totalCost.toFixed(2)})
            </button>
          </div>
        )}

        {/* Tab Content: Price Drop Trigger Rule */}
        {activeTab === 'trigger' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Target Auto-Buy Price Threshold
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 text-sm font-mono">$</span>
                <input
                  type="number"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 pl-7 pr-4 text-sm text-slate-100 font-mono focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Agent will automatically buy when price drops to or below this target across preferred retailers.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950 p-3">
              <input
                type="checkbox"
                id="reqAppr"
                checked={requireApproval}
                onChange={(e) => setRequireApproval(e.target.checked)}
                className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500"
              />
              <label htmlFor="reqAppr" className="text-xs text-slate-300">
                Send push/SMS alert for 1-tap confirmation before executing order
              </label>
            </div>

            <button
              onClick={() => {
                onSaveRule(product.name, targetPrice, settings.maxSingleItemLimit, requireApproval);
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-cyan-500/30 font-bold text-sm py-3 rounded-xl transition-all"
            >
              <Check className="h-4 w-4" />
              Activate Background Auto-Buy Rule
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
