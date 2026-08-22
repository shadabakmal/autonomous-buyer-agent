import { NextResponse } from 'next/server';
import { verifyRazorpaySignature } from '../../../../lib/razorpay';
import { logAuditEntry } from '../../../../lib/auditLogger';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount, merchantName = 'AuraSound Direct' } = body;

    const isValid = verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);

    if (!isValid) {
      logAuditEntry({
        transactionId: `TXN-${Date.now()}`,
        merchantName,
        amount: Number(amount || 0),
        currency: 'INR',
        status: 'RAZORPAY_FAILED_DECLINED',
        policyChecks: [],
        explanation: 'Invalid Razorpay Signature / Security Verification Mismatch.',
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        failureReason: 'HMAC-SHA256 Signature Verification Failed',
      });

      return NextResponse.json({ success: false, error: 'Invalid Payment Signature' }, { status: 400 });
    }

    logAuditEntry({
      transactionId: `TXN-${Date.now()}`,
      merchantName,
      amount: Number(amount || 0),
      currency: 'INR',
      status: 'RAZORPAY_SUCCESS',
      policyChecks: [
        {
          policyId: 'POL-SIG-001',
          ruleName: 'Razorpay HMAC-SHA256 Cryptographic Signature Verification',
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
    return NextResponse.json({ error: err.message || 'Verification error' }, { status: 500 });
  }
}
