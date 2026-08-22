'use client';

import React from 'react';
import { AgentStep } from '../lib/types';
import { Search, Shield, BarChart3, CheckCircle2, AlertTriangle, Loader2, ShoppingBag } from 'lucide-react';

interface AgentExecutionLogProps {
  steps: AgentStep[];
}

export default function AgentExecutionLog({ steps }: AgentExecutionLogProps) {
  const getStepIcon = (stepName: AgentStep['stepName'], status: AgentStep['status']) => {
    if (status === 'in_progress') {
      return <Loader2 className="h-4 w-4 text-cyan-400 animate-spin" />;
    }
    if (status === 'warning') {
      return <AlertTriangle className="h-4 w-4 text-amber-400" />;
    }
    if (status === 'failed') {
      return <AlertTriangle className="h-4 w-4 text-rose-500" />;
    }

    switch (stepName) {
      case 'searching_stores':
        return <Search className="h-4 w-4 text-cyan-400" />;
      case 'scraping_reviews':
      case 'fake_detection':
      case 'analyzing_sentiment':
        return <BarChart3 className="h-4 w-4 text-indigo-400" />;
      case 'checking_guardrails':
        return <Shield className="h-4 w-4 text-emerald-400" />;
      case 'purchasing':
      case 'completed':
        return <ShoppingBag className="h-4 w-4 text-emerald-400" />;
      default:
        return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
    }
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-cyan-400 animate-ping" />
          <h3 className="font-semibold text-sm text-slate-200 uppercase tracking-wider">
            Agent Reasoning & Live Execution Stepper
          </h3>
        </div>
        <span className="text-xs text-slate-400">{steps.length} Steps Recorded</span>
      </div>

      <div className="space-y-4">
        {steps.map((step, idx) => {
          const isLast = idx === steps.length - 1;
          return (
            <div key={step.id} className="relative flex gap-3 group">
              {/* Connector line */}
              {!isLast && (
                <div className="absolute left-4 top-7 -bottom-4 w-0.5 bg-slate-800 group-hover:bg-slate-700 transition-colors" />
              )}

              {/* Icon Bubble */}
              <div
                className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${
                  step.status === 'in_progress'
                    ? 'border-cyan-500/50 bg-cyan-950/60 shadow-lg shadow-cyan-500/10'
                    : step.status === 'warning'
                    ? 'border-amber-500/50 bg-amber-950/40'
                    : step.status === 'completed'
                    ? 'border-emerald-500/40 bg-emerald-950/30'
                    : 'border-slate-800 bg-slate-900'
                }`}
              >
                {getStepIcon(step.stepName, step.status)}
              </div>

              {/* Content */}
              <div className="flex-1 rounded-lg border border-slate-800/80 bg-slate-950/40 p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-xs text-slate-200">{step.title}</span>
                  <span className="text-[10px] text-slate-500 font-mono">{step.timestamp}</span>
                </div>
                <p className="mt-1 text-xs text-slate-400 leading-relaxed">{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
