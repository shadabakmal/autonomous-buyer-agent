'use client';

import React from 'react';
import { AuditLogEntry } from '../lib/auditLogger';
import { ShieldCheck, AlertTriangle, CheckCircle2, Lock, FileText, CornerDownRight } from 'lucide-react';

interface MoneyAuditTrailProps {
  logs: AuditLogEntry[];
}

export default function MoneyAuditTrail({ logs }: MoneyAuditTrailProps) {
  const getStatusBadge = (status: AuditLogEntry['status']) => {
    switch (status) {
      case 'RAZORPAY_SUCCESS':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'AUTHORIZED':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      case 'BLOCKED_BY_POLICY':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'RAZORPAY_FAILED_DECLINED':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'RECOVERED_GRACEFULLY':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
      default:
        return 'bg-slate-800 text-slate-300';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
            <Lock className="h-4 w-4 text-emerald-400" />
            Bounded & Explainable Financial Audit Log
          </h3>
          <p className="text-xs text-slate-400">Cryptographic audit trail of every financial action & policy check</p>
        </div>
        <span className="text-xs text-slate-500 font-mono">{logs.length} Audit Entries</span>
      </div>

      <div className="space-y-4">
        {logs.map((entry) => (
          <div key={entry.id} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-3 shadow-xl">
            
            {/* Entry Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-xs text-slate-200">{entry.transactionId}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusBadge(entry.status)}`}>
                  {entry.status.replace(/_/g, ' ')}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">{new Date(entry.timestamp).toLocaleString()}</span>
            </div>

            {/* Transaction Details */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
              <span className="text-slate-300">Merchant: <strong className="text-slate-100">{entry.merchantName}</strong></span>
              <span className="text-emerald-400 font-bold text-sm">${entry.amount.toFixed(2)} {entry.currency}</span>
            </div>

            {/* Explanation Box */}
            <div className="rounded-xl bg-slate-950 border border-slate-800/80 p-3 text-xs text-slate-300">
              <strong className="text-cyan-400 font-semibold">Explanation: </strong>
              {entry.explanation}
            </div>

            {/* Policy Checks Breakdown */}
            {entry.policyChecks && entry.policyChecks.length > 0 && (
              <div className="space-y-2 pt-1">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Policy Engine Gate Verification:</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {entry.policyChecks.map((chk, idx) => (
                    <div
                      key={idx}
                      className={`flex items-start gap-2 p-2 rounded-lg border text-[11px] ${
                        chk.passed
                          ? 'border-emerald-500/20 bg-emerald-950/20 text-emerald-300'
                          : 'border-amber-500/30 bg-amber-950/30 text-amber-300'
                      }`}
                    >
                      {chk.passed ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0 mt-0.5" /> : <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />}
                      <div>
                        <div className="font-semibold">{chk.ruleName} [{chk.policyId}]</div>
                        <div className="opacity-90 text-[10px] mt-0.5">{chk.details}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Razorpay Signature Data if available */}
            {entry.razorpayOrderId && (
              <div className="flex items-center gap-4 text-[10px] text-slate-400 font-mono pt-1">
                <span>Razorpay Order ID: <strong className="text-cyan-400">{entry.razorpayOrderId}</strong></span>
                {entry.razorpayPaymentId && (
                  <span>Payment ID: <strong className="text-emerald-400">{entry.razorpayPaymentId}</strong></span>
                )}
              </div>
            )}

            {/* Graceful Recovery Info */}
            {entry.failureReason && (
              <div className="rounded-xl bg-amber-950/30 border border-amber-500/30 p-3 text-xs space-y-1">
                <div className="font-bold text-amber-300 flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5" /> Intercepted Failure: {entry.failureReason}
                </div>
                {entry.recoveryAction && (
                  <div className="text-slate-300 flex items-center gap-1.5 pl-2 text-[11px]">
                    <CornerDownRight className="h-3.5 w-3.5 text-indigo-400" />
                    <strong>Graceful Fallback: </strong> {entry.recoveryAction}
                  </div>
                )}
              </div>
            )}

          </div>
        ))}
      </div>
    </div>
  );
}
