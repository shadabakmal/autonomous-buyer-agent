'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product, RetailerListing } from '../lib/types';
import { Star, ShieldCheck, Tag, ExternalLink, Zap, ArrowRight } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onSelectBuy?: (product: Product, retailer: RetailerListing) => void;
  onSetRule?: (product: Product) => void;
}

export default function ProductCard({ product, onSelectBuy, onSetRule }: ProductCardProps) {
  const bestRetailer = product.retailers.find((r) => r.isBestValue) || product.retailers[0];

  return (
    <div className="group rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-lg hover:border-slate-700 transition-all duration-300 flex flex-col justify-between">
      
      {/* Top Media & Tags */}
      <div>
        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-950 border border-slate-800">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />

          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            <span className="rounded-md bg-slate-950/80 backdrop-blur border border-slate-700 px-2 py-0.5 text-[10px] font-medium text-slate-300">
              {product.category}
            </span>
            {product.sentiment.verdict === 'Must Buy' && (
              <span className="rounded-md bg-emerald-500/90 text-slate-950 px-2 py-0.5 text-[10px] font-bold shadow-md">
                TOP AI PICK
              </span>
            )}
          </div>

          <div className="absolute bottom-3 right-3 bg-slate-950/90 backdrop-blur px-2.5 py-1 rounded-lg border border-slate-700 flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-bold text-slate-100">{product.rating}</span>
            <span className="text-[10px] text-slate-400">({product.reviewCount})</span>
          </div>
        </div>

        {/* Title & Brand */}
        <div className="mt-4">
          <div className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">{product.brand}</div>
          <h3 className="mt-1 font-semibold text-base text-slate-100 line-clamp-2 group-hover:text-cyan-300 transition-colors">
            {product.name}
          </h3>
          <p className="mt-1 text-xs text-slate-400 line-clamp-2 leading-relaxed">{product.description}</p>
        </div>

        {/* Store Compare Matrix */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2">
          <div className="text-[11px] font-semibold text-slate-400 flex items-center justify-between">
            <span>STORE MATRIX</span>
            <span className="text-emerald-400 font-mono text-xs font-bold">Best: ${bestRetailer.price.toFixed(2)}</span>
          </div>

          <div className="space-y-1.5">
            {product.retailers.slice(0, 3).map((ret) => (
              <div
                key={ret.id}
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs ${
                  ret.isBestValue
                    ? 'bg-cyan-950/40 border border-cyan-500/30 text-cyan-200'
                    : 'bg-slate-950/60 border border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{ret.logo}</span>
                  <span className="font-medium">{ret.name}</span>
                  {ret.isBestValue && (
                    <span className="text-[9px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.2 rounded font-semibold">
                      Lowest
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 font-mono">
                  {ret.originalPrice > ret.price && (
                    <span className="line-through text-slate-500 text-[10px]">
                      ${ret.originalPrice.toFixed(2)}
                    </span>
                  )}
                  <span className="font-bold text-slate-100">${ret.price.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-5 pt-4 border-t border-slate-800 flex items-center gap-2">
        <button
          onClick={() => onSelectBuy && onSelectBuy(product, bestRetailer)}
          className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs py-2.5 px-3 rounded-xl transition-all shadow-md shadow-cyan-500/10 active:scale-[0.98]"
        >
          <Zap className="h-4 w-4 fill-slate-950" />
          Buy with Agent
        </button>

        <button
          onClick={() => onSetRule && onSetRule(product)}
          className="flex items-center justify-center p-2.5 rounded-xl border border-slate-700 bg-slate-950 text-slate-300 hover:border-cyan-500/50 hover:text-cyan-400 transition-colors"
          title="Set Auto-Buy Trigger"
        >
          <Tag className="h-4 w-4" />
        </button>

        <Link
          href={`/compare?id=${product.id}`}
          className="flex items-center justify-center p-2.5 rounded-xl border border-slate-700 bg-slate-950 text-slate-300 hover:border-cyan-500/50 hover:text-cyan-400 transition-colors"
          title="Deep Sentiment Breakdown"
        >
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

    </div>
  );
}
