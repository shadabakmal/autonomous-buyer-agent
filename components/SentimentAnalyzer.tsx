'use client';

import React from 'react';
import { ReviewSentiment } from '../lib/types';
import { ShieldCheck, ThumbsUp, ThumbsDown, Sparkles, Check, AlertCircle } from 'lucide-react';

interface SentimentAnalyzerProps {
  sentiment: ReviewSentiment;
  productName: string;
}

export default function SentimentAnalyzer({ sentiment, productName }: SentimentAnalyzerProps) {
  const getVerdictBadge = (verdict: ReviewSentiment['verdict']) => {
    switch (verdict) {
      case 'Must Buy':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'Good Value':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      case 'Consider Alternatives':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      default:
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    }
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl space-y-6">
      
      {/* Header Verdict & Scores */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-cyan-400" />
            <h3 className="font-semibold text-base text-slate-100">AI Review & Trust Synthesis</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Aggregated from verified buyers & NLP bot filters</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Trust Score Gauge */}
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <div>
              <div className="text-[10px] text-slate-400">Trust Score</div>
              <div className="text-xs font-bold text-emerald-400">{sentiment.trustScore}% Verified</div>
            </div>
          </div>

          {/* Verdict Tag */}
          <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${getVerdictBadge(sentiment.verdict)}`}>
            {sentiment.verdict}
          </span>
        </div>
      </div>

      {/* AI Summary Text */}
      <div className="rounded-lg bg-cyan-950/20 border border-cyan-500/20 p-4">
        <p className="text-xs text-cyan-200 leading-relaxed font-normal">
          <strong className="font-semibold text-cyan-300">Agent Verdict: </strong>
          {sentiment.summaryText}
        </p>
      </div>

      {/* Pros & Cons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Pros */}
        <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-medium text-xs border-b border-slate-800/80 pb-2">
            <ThumbsUp className="h-3.5 w-3.5" />
            Key Strengths (Verified Positive Clusters)
          </div>
          <ul className="space-y-2 pt-1">
            {sentiment.pros.map((pro, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>{pro}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Cons */}
        <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4 space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-medium text-xs border-b border-slate-800/80 pb-2">
            <ThumbsDown className="h-3.5 w-3.5" />
            Noted Drawbacks & Considerations
          </div>
          <ul className="space-y-2 pt-1">
            {sentiment.cons.map((con, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                <AlertCircle className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>{con}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* Feature Ratings Breakdown */}
      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Feature Performance Ratings</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {sentiment.featureRatings.map((f, idx) => (
            <div key={idx} className="flex items-center justify-between bg-slate-950 border border-slate-800/80 px-3 py-2 rounded-lg">
              <span className="text-xs text-slate-300">{f.feature}</span>
              <div className="flex items-center gap-2">
                <div className="w-20 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full rounded-full"
                    style={{ width: `${(f.score / 5) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-mono text-cyan-400 font-semibold">{f.score.toFixed(1)}/5</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
