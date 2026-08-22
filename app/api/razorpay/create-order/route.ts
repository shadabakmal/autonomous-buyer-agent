import { NextResponse } from 'next/server';
import { createRazorpayTestOrder } from '../../../../lib/razorpay';
import { evaluateMoneyAction } from '../../../../lib/policyEngine';
import { logAuditEntry } from '../../../../lib/auditLogger';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, currency = 'INR', merchantName = 'AuraSound Direct', userMaxCap = 500, monthlyRemaining = 2000 } = body;

    // Evaluate Bounded Money Action Policy
    const policyResult = evaluateMoneyAction({
      amount: Number(amount),
      currency,
      merchantId: 'merch-aurasound-india-001',
      merchantName,
      buyerAgentId: 'agent-buyer-007',
      userMaxCap: Number(userMaxCap),
      monthlyRemaining: Number(monthlyRemaining),
      isTestMode: true,
    });

    if (!policyResult.approved) {
      logAuditEntry({
        transactionId: `TXN-${Date.now()}`,
        merchantName,
        amount: Number(amount),
        currency,
        status: 'BLOCKED_BY_POLICY',
        policyChecks: policyResult.checks,
        explanation: policyResult.explanation,
        failureReason: 'Policy Engine Check Failed (Financial Guardrail Breach)',
        recoveryAction: 'Intercepted & sent 1-tap approval request to user.',
      });

      return NextResponse.json(
        {
          error: 'Financial policy guardrail breach',
          approved: false,
          checks: policyResult.checks,
          explanation: policyResult.explanation,
        },
        { status: 400 }
      );
    }

    // Policy Approved -> Create Razorpay Test Order
    const order = await createRazorpayTestOrder(Number(amount), currency);

    logAuditEntry({
      transactionId: `TXN-${Date.now()}`,
      merchantName,
      amount: Number(amount),
      currency,
      status: 'AUTHORIZED',
      policyChecks: policyResult.checks,
      explanation: 'Authorized by Policy Engine. Razorpay Test Order Created.',
      razorpayOrderId: order.id,
    });

    return NextResponse.json({
      success: true,
      order,
      approved: true,
      checks: policyResult.checks,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create order' }, { status: 500 });
  }
}
