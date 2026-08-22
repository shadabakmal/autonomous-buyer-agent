'use client';

import React from 'react';
import { UpsellOffer } from '../lib/upsellEngine';
import { TrendingUp, Plus, Check } from 'lucide-react';

interface UpsellOfferCardProps {
  offer: UpsellOffer;
  isSelected: boolean;
  onToggle: (offer: UpsellOffer) => void;
}

export default function UpsellOfferCard({ offer, isSelected, onToggle }: UpsellOfferCardProps) {
  return (
    <div
      onClick={() => onToggle(offer)}
      className={`cursor-pointer rounded-2xl border p-4 transition-all duration-200 ${
        isSelected
          ? 'border-emerald-500 bg-emerald-950/20 shadow-lg shadow-emerald-500/10'
          : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider">
              {offer.badge}
            </span>
            <span className="text-[10px] text-cyan-400 font-mono flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> +{offer.aovBoostAmount} AOV Boost
            </span>
          </div>

          <h4 className="font-bold text-xs text-slate-100">{offer.title}</h4>
          <p className="text-[11px] text-slate-400 leading-relaxed">{offer.description}</p>
        </div>

        <div className="text-right shrink-0">
          <div className="text-xs font-mono font-bold text-emerald-400">+${offer.bundlePrice.toFixed(2)}</div>
          <div className="line-through text-[10px] text-slate-500 font-mono">${offer.originalPrice.toFixed(2)}</div>
          <div className="mt-2 flex justify-end">
            <div className={`flex h-6 w-6 items-center justify-center rounded-lg border ${
              isSelected ? 'bg-emerald-500 border-emerald-500 text-slate-950' : 'border-slate-700 bg-slate-950 text-slate-400'
            }`}>
              {isSelected ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
