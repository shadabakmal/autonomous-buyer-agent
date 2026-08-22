'use client';

import React, { useState } from 'react';
import { AlertTriangle, ShieldAlert, CornerDownRight, CheckCircle2, RefreshCw, Zap } from 'lucide-react';
import { logAuditEntry } from '../lib/auditLogger';

export default function FailureRecoveryCard() {
  const [activeScenario, setActiveScenario] = useState<'budget_exceeded' | 'card_declined' | 'stockout' | 'sig_mismatch'>('budget_exceeded');
  const [simulationState, setSimulationState] = useState<'idle' | 'running' | 'failed' | 'recovered'>('idle');
  const [failureLog, setFailureLog] = useState<{
    failureTitle: string;
    gateReason: string;
    recoveryAction: string;
    recoveredSuccessfully: boolean;
  } | null>(null);

  const runFailureSimulation = (scenario: typeof activeScenario) => {
    setActiveScenario(scenario);
    setSimulationState('running');
    setFailureLog(null);

    setTimeout(() => {
      let logData = {
        failureTitle: '',
        gateReason: '',
        recoveryAction: '',
        recoveredSuccessfully: true,
      };

      if (scenario === 'budget_exceeded') {
        logData = {
          failureTitle: 'Financial Policy Gate Block: Spend Ceiling Exceeded',
          gateReason: 'Item price ($650.00) exceeds maximum single transaction cap ($500.00). Money action blocked before gateway.',
          recoveryAction: 'Gracefully intercepted: Agent paused checkout, released cart hold, and issued a 1-tap manual override request to the user.',
          recoveredSuccessfully: true,
        };

        logAuditEntry({
          transactionId: `TXN-SIM-${Date.now()}`,
          merchantName: 'AuraSound Direct',
          amount: 650.00,
          currency: 'INR',
          status: 'RECOVERED_GRACEFULLY',
          policyChecks: [
            {
              policyId: 'POL-001',
              ruleName: 'Single Item Spend Ceiling',
              passed: false,
              details: 'Amount $650.00 exceeds ceiling of $500.00',
              timestamp: new Date().toISOString(),
            },
          ],
          explanation: 'Blocked by Policy Engine: Amount exceeds user safety guardrail.',
          failureReason: logData.gateReason,
          recoveryAction: logData.recoveryAction,
        });
      } else if (scenario === 'card_declined') {
        logData = {
          failureTitle: 'Razorpay Gateway Failure: Card / UPI Declined',
          gateReason: 'Razorpay Test API returned status code 402 (Insufficient Funds / Card Declined).',
          recoveryAction: 'Gracefully intercepted: Agent captured error trace, prevented duplicate charging, and retried automatically using secondary payment method (Visa ending in 4829).',
          recoveredSuccessfully: true,
        };

        logAuditEntry({
          transactionId: `TXN-SIM-${Date.now()}`,
          merchantName: 'Best Buy Store',
          amount: 199.99,
          currency: 'INR',
          status: 'RECOVERED_GRACEFULLY',
          policyChecks: [],
          explanation: 'Razorpay payment failure handled gracefully with failover wallet retry.',
          failureReason: logData.gateReason,
          recoveryAction: logData.recoveryAction,
        });
      } else if (scenario === 'stockout') {
        logData = {
          failureTitle: 'Inventory Real-Time Stockout',
          gateReason: 'Merchant inventory level dropped to 0 during checkout sequence.',
          recoveryAction: 'Gracefully intercepted: Agent voided order reservation, refunded authorized funds, and recommended equivalent verified model with instant $20 discount.',
          recoveredSuccessfully: true,
        };
      } else {
        logData = {
          failureTitle: 'HMAC Signature Verification Mismatch',
          gateReason: 'Cryptographic hash mismatch detected on payment webhook payload.',
          recoveryAction: 'Gracefully intercepted: Payment marked unverified, order held in security quarantine, and merchant notified for re-signing.',
          recoveredSuccessfully: true,
        };
      }

      setFailureLog(logData);
      setSimulationState('recovered');
    }, 1200);
  };

  return (
    <div className="rounded-3xl border border-amber-500/30 bg-slate-900/90 p-6 space-y-6 shadow-2xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-2">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-1">
            <AlertTriangle className="h-4 w-4" />
            "The Bar" Requirement — Graceful Failure & Bounded Recovery Engine
          </div>
          <h3 className="text-xl font-extrabold text-slate-100">Interactive Failure Recovery Simulator</h3>
          <p className="text-xs text-slate-400">Demonstrates how the agent handles financial blocks, gateway errors, and stockouts without crashing or losing funds</p>
        </div>

        <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-400 border border-amber-500/20">
          STRESS TEST SUITE
        </span>
      </div>

      {/* Scenario Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { id: 'budget_exceeded', label: '1. Financial Cap Breach', desc: 'Price > User Limit' },
          { id: 'card_declined', label: '2. Gateway Card Decline', desc: 'Razorpay 402 Error' },
          { id: 'stockout', label: '3. Merchant Stockout', desc: 'Zero inventory hold' },
          { id: 'sig_mismatch', label: '4. Signature Mismatch', desc: 'Security hash fail' },
        ].map((s) => (
          <button
            key={s.id}
            onClick={() => runFailureSimulation(s.id as any)}
            className={`p-3 rounded-xl border text-left transition-all ${
              activeScenario === s.id
                ? 'bg-amber-950/40 border-amber-500 text-amber-200 shadow-md'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            <div className="font-bold text-xs">{s.label}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">{s.desc}</div>
          </button>
        ))}
      </div>

      {/* Execution Visualizer */}
      {simulationState === 'running' && (
        <div className="py-8 text-center space-y-2">
          <RefreshCw className="h-6 w-6 text-amber-400 animate-spin mx-auto" />
          <div className="text-xs font-semibold text-slate-300">Simulating failure event & executing policy interception...</div>
        </div>
      )}

      {failureLog && simulationState === 'recovered' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          
          {/* Failure Box */}
          <div className="rounded-2xl border border-rose-500/30 bg-rose-950/20 p-4 space-y-2 text-xs">
            <div className="flex items-center justify-between text-rose-400 font-bold">
              <span className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4" />
                {failureLog.failureTitle}
              </span>
              <span className="rounded bg-rose-500/20 px-2 py-0.5 text-[10px] uppercase font-bold">INTERCEPTED</span>
            </div>
            <p className="text-slate-300 leading-relaxed pl-6">{failureLog.gateReason}</p>
          </div>

          {/* Graceful Recovery Box */}
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4 space-y-2 text-xs">
            <div className="flex items-center justify-between text-emerald-400 font-bold">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Graceful Recovery Executed (Zero Data or Money Loss)
              </span>
              <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] uppercase font-bold">SUCCESSFUL FALLBACK</span>
            </div>
            <p className="text-slate-200 leading-relaxed pl-6 flex items-start gap-2">
              <CornerDownRight className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{failureLog.recoveryAction}</span>
            </p>
          </div>

        </div>
      )}

    </div>
  );
}
