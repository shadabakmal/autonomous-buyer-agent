import { PolicyCheckResult } from './policyEngine';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  transactionId: string;
  merchantName: string;
  amount: number;
  currency: string;
  status: 'AUTHORIZED' | 'BLOCKED_BY_POLICY' | 'RAZORPAY_SUCCESS' | 'RAZORPAY_FAILED_DECLINED' | 'RECOVERED_GRACEFULLY';
  policyChecks: PolicyCheckResult[];
  explanation: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  failureReason?: string;
  recoveryAction?: string;
}

export const GLOBAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'aud-9801',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    transactionId: 'TXN-88401-RZP',
    merchantName: 'AuraSound Merchant Store',
    amount: 328.00,
    currency: 'INR',
    status: 'RAZORPAY_SUCCESS',
    policyChecks: [
      {
        policyId: 'POL-001',
        ruleName: 'Single Item Spend Ceiling',
        passed: true,
        details: 'Transaction amount ($328.00) within max limit ($500.00).',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        policyId: 'POL-002',
        ruleName: 'Monthly Aggregate Spend Ceiling',
        passed: true,
        details: 'Amount ($328.00) within remaining monthly budget ($1,850.00).',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
      },
    ],
    explanation: 'Order authorized & verified via Razorpay Test-Mode Signature HMAC-SHA256.',
    razorpayOrderId: 'order_O9xL30k2P9q1Z',
    razorpayPaymentId: 'pay_P92kL110xZq',
  },
  {
    id: 'aud-9799',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    transactionId: 'TXN-88398-FAIL',
    merchantName: 'Quantum Tech Gear',
    amount: 650.00,
    currency: 'INR',
    status: 'BLOCKED_BY_POLICY',
    policyChecks: [
      {
        policyId: 'POL-001',
        ruleName: 'Single Item Spend Ceiling',
        passed: false,
        details: 'Transaction amount ($650.00) EXCEEDS max single cap ($500.00).',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
      },
    ],
    explanation: 'Blocked by Policy Engine: Amount exceeds user safety guardrail.',
    failureReason: 'Single Item Spend Ceiling Breach ($650 > $500 cap).',
    recoveryAction: 'Interception triggered: Prompted user for 1-tap manual approval authorization.',
  },
];

export function logAuditEntry(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): AuditLogEntry {
  const newEntry: AuditLogEntry = {
    ...entry,
    id: `aud-${Date.now()}`,
    timestamp: new Date().toISOString(),
  };
  GLOBAL_AUDIT_LOGS.unshift(newEntry);
  return newEntry;
}
