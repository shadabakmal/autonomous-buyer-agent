'use client';

import React from 'react';
import { PricePoint } from '../lib/types';
import { TrendingDown, Calendar, AlertCircle } from 'lucide-react';

interface PriceHistoryChartProps {
  priceHistory: PricePoint[];
  predictedDrop?: {
    expectedPrice: number;
    daysAway: number;
    confidence: number;
  };
}

export default function PriceHistoryChart({ priceHistory, predictedDrop }: PriceHistoryChartProps) {
  if (!priceHistory || priceHistory.length === 0) return null;

  const prices = priceHistory.map((p) => p.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice || 1;

  const currentPrice = prices[prices.length - 1];

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-emerald-400" />
            <h3 className="font-semibold text-sm text-slate-200">Price Trend & Drop Forecast</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Historical tracking across major retailers</p>
        </div>

        <div className="text-right">
          <div className="text-xs text-slate-400">Current Lowest</div>
          <div className="text-base font-bold text-emerald-400 font-mono">${currentPrice.toFixed(2)}</div>
        </div>
      </div>

      {/* Visual Chart Bars */}
      <div className="pt-2">
        <div className="flex items-end justify-between h-32 gap-2 px-2 border-b border-slate-800 pb-2">
          {priceHistory.map((pt, idx) => {
            const heightPercent = Math.max(15, Math.round(((pt.price - minPrice) / priceRange) * 70 + 20));
            const isLowest = pt.price === minPrice;
            const isCurrent = idx === priceHistory.length - 1;

            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 group relative">
                
                {/* Tooltip */}
                <div className="absolute -top-8 bg-slate-950 border border-slate-700 px-2 py-0.5 rounded text-[10px] text-slate-200 font-mono opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none whitespace-nowrap shadow-lg">
                  ${pt.price.toFixed(2)} ({pt.retailer})
                </div>

                <div className="w-full bg-slate-950 rounded-t h-full flex items-end">
                  <div
                    className={`w-full rounded-t transition-all duration-300 ${
                      isCurrent
                        ? 'bg-gradient-to-t from-cyan-600 to-cyan-400'
                        : isLowest
                        ? 'bg-gradient-to-t from-emerald-600 to-emerald-400'
                        : 'bg-slate-700 group-hover:bg-slate-600'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>

                <span className="text-[10px] text-slate-500 font-mono">{pt.date}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Price Drop Predictor Box */}
      {predictedDrop && (
        <div className="rounded-lg bg-emerald-950/20 border border-emerald-500/20 p-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Calendar className="h-4 w-4 text-emerald-400 shrink-0" />
            <div>
              <div className="text-xs font-semibold text-emerald-300">
                AI Price Drop Predictor: Drop to ${predictedDrop.expectedPrice.toFixed(2)} expected in ~{predictedDrop.daysAway} days
              </div>
              <div className="text-[11px] text-slate-400">
                Confidence rating: {predictedDrop.confidence}% based on historical seasonal discount cycles
              </div>
            </div>
          </div>
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 border border-emerald-500/30 px-2 py-1 rounded">
            RECOMMEND WAITING
          </span>
        </div>
      )}
    </div>
  );
}
