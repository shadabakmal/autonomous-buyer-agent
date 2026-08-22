import { prisma } from './db';
import { PolicyCheckResult } from './policyEngine';

export interface AuditLogEntry {
  id: string;
  userId?: string;
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

export async function logAuditEntry(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<AuditLogEntry> {
  const created = await prisma.auditLog.create({
    data: {
      userId: entry.userId || null,
      transactionId: entry.transactionId,
      merchantName: entry.merchantName,
      amount: entry.amount,
      currency: entry.currency,
      status: entry.status,
      policyChecks: JSON.stringify(entry.policyChecks),
      explanation: entry.explanation,
      razorpayOrderId: entry.razorpayOrderId || null,
      razorpayPaymentId: entry.razorpayPaymentId || null,
      failureReason: entry.failureReason || null,
      recoveryAction: entry.recoveryAction || null,
    },
  });

  return {
    id: created.id,
    userId: created.userId || undefined,
    timestamp: created.timestamp.toISOString(),
    transactionId: created.transactionId,
    merchantName: created.merchantName,
    amount: created.amount,
    currency: created.currency,
    status: created.status as AuditLogEntry['status'],
    policyChecks: JSON.parse(created.policyChecks),
    explanation: created.explanation,
    razorpayOrderId: created.razorpayOrderId || undefined,
    razorpayPaymentId: created.razorpayPaymentId || undefined,
    failureReason: created.failureReason || undefined,
    recoveryAction: created.recoveryAction || undefined,
  };
}

export async function fetchRecentAuditLogs(limit: number = 20): Promise<AuditLogEntry[]> {
  const logs = await prisma.auditLog.findMany({
    orderBy: { timestamp: 'desc' },
    take: limit,
  });

  return logs.map((log) => ({
    id: log.id,
    userId: log.userId || undefined,
    timestamp: log.timestamp.toISOString(),
    transactionId: log.transactionId,
    merchantName: log.merchantName,
    amount: log.amount,
    currency: log.currency,
    status: log.status as AuditLogEntry['status'],
    policyChecks: JSON.parse(log.policyChecks),
    explanation: log.explanation,
    razorpayOrderId: log.razorpayOrderId || undefined,
    razorpayPaymentId: log.razorpayPaymentId || undefined,
    failureReason: log.failureReason || undefined,
    recoveryAction: log.recoveryAction || undefined,
  }));
}
