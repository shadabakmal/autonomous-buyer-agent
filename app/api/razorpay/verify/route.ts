import { NextResponse } from 'next/server';
import { getAuthenticatedUserContext } from '../../../../lib/auth';
import { checkRateLimit } from '../../../../lib/rateLimit';
import { verifyRazorpaySignature } from '../../../../lib/razorpay';
import { logAuditEntry } from '../../../../lib/auditLogger';

export async function POST(req: Request) {
  try {
    // 1. Server-Side Authentication
    const authContext = await getAuthenticatedUserContext(req);
    if (!authContext) {
      return NextResponse.json({ error: 'Unauthorized', errorCode: 'UNAUTHORIZED' }, { status: 401 });
    }

    // 2. Rate Limit
    const rateLimit = checkRateLimit(authContext.user.id, 10, 60000);
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded', errorCode: 'RATE_LIMITED' }, { status: 429 });
    }

    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount, merchantName = 'AuraSound Direct' } = body;

    // 3. Strict HMAC-SHA256 Verification (No bypasses)
    const isValid = verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);

    if (!isValid) {
      await logAuditEntry({
        userId: authContext.user.id,
        transactionId: `TXN-${Date.now()}`,
        merchantName,
        amount: Number(amount || 0),
        currency: 'INR',
        status: 'RAZORPAY_FAILED_DECLINED',
        policyChecks: [],
        explanation: 'Invalid Razorpay Signature / HMAC Verification Mismatch.',
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        failureReason: 'HMAC-SHA256 Signature Verification Mismatch',
      });

      return NextResponse.json({ success: false, error: 'Invalid HMAC Signature Verification', errorCode: 'INVALID_SIGNATURE' }, { status: 400 });
    }

    await logAuditEntry({
      userId: authContext.user.id,
      transactionId: `TXN-${Date.now()}`,
      merchantName,
      amount: Number(amount || 0),
      currency: 'INR',
      status: 'RAZORPAY_SUCCESS',
      policyChecks: [
        {
          policyId: 'POL-SIG-001',
          ruleName: 'Razorpay HMAC-SHA256 Signature Verification',
          passed: true,
          details: 'Valid cryptographic signature matching secret key.',
          timestamp: new Date().toISOString(),
        },
      ],
      explanation: 'Razorpay Test-Mode Payment Confirmed and Signature Verified.',
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
    });

    return NextResponse.json({ success: true, verified: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Verification error', errorCode: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
