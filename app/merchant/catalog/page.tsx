'use client';

import React, { useState, useEffect } from 'react';
import MerchantNavbar from '../../../components/MerchantNavbar';
import { Database, Code, CheckCircle2, Copy, ExternalLink, Zap } from 'lucide-react';
import { generateAgenticCatalogResponse } from '../../../lib/agenticCatalog';

export default function AgenticCatalogPage() {
  const [catalogJson, setCatalogJson] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const data = generateAgenticCatalogResponse();
    setCatalogJson(JSON.stringify(data, null, 2));
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(catalogJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <MerchantNavbar />

      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-6 gap-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs uppercase tracking-wider mb-1">
              <Database className="h-4 w-4" />
              Machine-Readable AI Buyer Standard
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">Agentic Catalog Endpoint (ACP / AP2 / x402)</h1>
            <p className="text-xs text-slate-400 mt-1">
              Makes your product catalog readable and queryable by autonomous AI buyer agents across global protocols
            </p>
          </div>

          <a
            href="/api/agent/catalog"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-xl bg-slate-900 border border-slate-700 px-4 py-2.5 text-xs font-bold text-cyan-400 hover:border-cyan-500 transition-colors shadow-md"
          >
            <ExternalLink className="h-4 w-4" />
            Open `/api/agent/catalog` JSON
          </a>
        </div>

        {/* Protocol Spec Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-1">
            <div className="text-xs text-slate-400 font-semibold">PROTOCOL SPECIFICATION</div>
            <div className="text-sm font-bold text-cyan-400 font-mono">ACP / AP2 / x402 v1.0.0</div>
            <div className="text-[11px] text-slate-400">NPCI UAP & Global Agent Standard Compliant</div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-1">
            <div className="text-xs text-slate-400 font-semibold">PAYMENT GATEWAY SPEC</div>
            <div className="text-sm font-bold text-emerald-400 font-mono">Razorpay Test-Mode + UPI AutoPay</div>
            <div className="text-[11px] text-slate-400">Automated signature validation enabled</div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-1">
            <div className="text-xs text-slate-400 font-semibold">AI BUYER DISCOVERY</div>
            <div className="text-sm font-bold text-indigo-400 font-mono">100% Machine Discoverable</div>
            <div className="text-[11px] text-slate-400">Zero scraping latency with JSON-LD schema</div>
          </div>
        </div>

        {/* JSON Code Inspector */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 space-y-4 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 font-mono text-xs text-slate-300">
              <Code className="h-4 w-4 text-cyan-400" />
              <span>Live Endpoint Payload: GET /api/agent/catalog</span>
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-slate-300 hover:text-cyan-400 transition-colors"
            >
              {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'Copied!' : 'Copy Schema'}
            </button>
          </div>

          <pre className="overflow-x-auto rounded-2xl bg-slate-950 p-4 text-xs font-mono text-cyan-300/90 leading-relaxed border border-slate-800 max-h-[500px]">
            <code>{catalogJson}</code>
          </pre>
        </div>

      </main>
    </div>
  );
}
