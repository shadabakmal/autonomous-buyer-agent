'use client';

import React, { useState } from 'react';
import MerchantNavbar from '../../../components/MerchantNavbar';
import MoneyAuditTrail from '../../../components/MoneyAuditTrail';
import { GLOBAL_AUDIT_LOGS } from '../../../lib/auditLogger';
import { ShieldCheck, Lock } from 'lucide-react';

export default function MerchantAuditPage() {
  const [logs] = useState(GLOBAL_AUDIT_LOGS);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <MerchantNavbar />

      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Page Header */}
        <div className="border-b border-slate-800 pb-6">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs uppercase tracking-wider mb-1">
            <ShieldCheck className="h-4 w-4" />
            "The Bar" Financial Integrity Requirement
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">Financial Action Audit Log</h1>
          <p className="text-xs text-slate-400 mt-1">
            Every transaction is explainable, policy-bounded, and gated before money moves through Razorpay
          </p>
        </div>

        {/* Audit Log Component */}
        <MoneyAuditTrail logs={logs} />

      </main>
    </div>
  );
}
