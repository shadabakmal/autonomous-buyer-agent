'use client';

import React from 'react';
import MerchantNavbar from '../../components/MerchantNavbar';
import FailureRecoveryCard from '../../components/FailureRecoveryCard';
import MoneyAuditTrail from '../../components/MoneyAuditTrail';
import { GLOBAL_AUDIT_LOGS } from '../../lib/auditLogger';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

export default function FailureDemoPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <MerchantNavbar />

      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Page Header */}
        <div className="border-b border-slate-800 pb-6">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs uppercase tracking-wider mb-1">
            <AlertTriangle className="h-4 w-4" />
            "The Bar" Requirement — One Failure Handled Gracefully
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">Failure Handling & Resiliency Simulator</h1>
          <p className="text-xs text-slate-400 mt-1">
            Test policy blocks, Razorpay gateway declines, signature mismatches, and stockouts with zero data loss or stuck funds
          </p>
        </div>

        {/* Interactive Simulator Card */}
        <FailureRecoveryCard />

        {/* Audit Log Stream */}
        <MoneyAuditTrail logs={GLOBAL_AUDIT_LOGS} />

      </main>
    </div>
  );
}
